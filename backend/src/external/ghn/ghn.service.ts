import { ghnClient } from "../../config/axios.js";
import { env } from "../../config/dotenv.js";
import { sleep } from "../../utils/index.js";
import { GHN_MAX_INSURANCE_VALUE } from "./ghn.constant.js";

interface GHNServiceOption {
	service_id: number;
	short_name: string;
	service_type_id: number;
}

// Cache service_id theo từng cặp quận "from-to": danh sách dịch vụ khả dụng giữa 2 quận gần như
// không đổi, nên cache lại để tránh gọi lại API available-services ở mỗi lần tính phí.
const serviceIdCache: Record<string, number> = {};

/** Lấy service_id phù hợp cho tuyến giao hàng từ kho (GHN_FROM_DISTRICT_ID) đến quận/huyện đích. */
async function getServiceId(toDistrictId: number): Promise<number> {
	const cacheKey = `${env.GHN_FROM_DISTRICT_ID}-${toDistrictId}`;
	if (serviceIdCache[cacheKey]) {
		return serviceIdCache[cacheKey];
	}

	const response = await ghnClient.post(`${env.GHN_API_URL}/v2/shipping-order/available-services`, {
		shop_id: Number(env.GHN_SHOP_ID),
		from_district: Number(env.GHN_FROM_DISTRICT_ID),
		to_district: toDistrictId,
	});

	const services: GHNServiceOption[] = response.data?.data ?? [];
	if (services.length === 0) {
		throw new Error("BadRequest: Địa chỉ giao hàng nằm ngoài khu vực phục vụ của Giao Hàng Nhanh.");
	}

	// Ưu tiên gói dịch vụ cấu hình ở GHN_SERVICE_TYPE_ID (mặc định 2 - "Chuẩn", tính cước theo khối
	// lượng thực) cho hàng nhẹ thông thường; nếu tuyến này không có gói đó thì lấy gói đầu tiên GHN trả về.
	const preferredServiceTypeId = Number(env.GHN_SERVICE_TYPE_ID);
	const preferred = services.find((service) => service.service_type_id === preferredServiceTypeId) ?? services[0]!;
	serviceIdCache[cacheKey] = preferred.service_id;
	return preferred.service_id;
}

interface CalculateShippingFeeInput {
	toDistrictId: number;
	toWardCode: string;
	/** Tổng khối lượng đơn hàng, tính bằng gram */
	weightGram: number;
	/** Kích thước đóng gói ước lượng của đơn hàng, tính bằng cm (xem order.utils.ts computeCartPackage) */
	lengthCm: number;
	widthCm: number;
	heightCm: number;
	/** Giá trị khai báo bảo hiểm hàng hóa (thường = subtotal của đơn hàng) */
	insuranceValue: number;
}

/** Gọi API GHN để tính phí vận chuyển thực tế theo địa chỉ giao hàng + khối lượng/kích thước đơn hàng. */
export async function calculateShippingFee({ toDistrictId, toWardCode, weightGram, lengthCm, widthCm, heightCm, insuranceValue }: CalculateShippingFeeInput): Promise<number> {
	try {
		const serviceId = await getServiceId(toDistrictId);

		const response = await ghnClient.post(`${env.GHN_API_URL}/v2/shipping-order/fee`, {
			service_id: serviceId,
			insurance_value: Math.min(Math.max(insuranceValue, 0), GHN_MAX_INSURANCE_VALUE),
			coupon: null,
			from_district_id: Number(env.GHN_FROM_DISTRICT_ID),
			from_ward_code: String(env.GHN_FROM_WARD_CODE),
			to_district_id: toDistrictId,
			to_ward_code: toWardCode,
			height: heightCm,
			length: lengthCm,
			width: widthCm,
			weight: weightGram,
		});

		const total = response.data?.data?.total;
		if (typeof total !== "number") {
			throw new Error("BadRequest: Không nhận được phí vận chuyển hợp lệ từ Giao Hàng Nhanh.");
		}

		return total;
	} catch (error: any) {
		// Lỗi đã được chuẩn hóa (vd. "BadRequest: ..." ném ra ở trên) thì cho đi tiếp nguyên vẹn
		if (error instanceof Error && /^(BadRequest|NotFound|Config):/.test(error.message)) {
			throw error;
		}

		// Lỗi từ phía GHN (vd. địa chỉ không hợp lệ, quá tải tuyến...) hoặc lỗi mạng
		const ghnMessage = error?.response?.data?.message;
		throw new Error(`BadRequest: Không thể tính phí vận chuyển cho địa chỉ này${ghnMessage ? ` (GHN: ${ghnMessage})` : ""}.`);
	}
}

interface CreateShippingOrderItem {
	name: string;
	quantity: number;
}

interface CreateShippingOrderInput {
	/** Mã đơn hàng bên hệ thống mình (Order.orderNumber) — gửi làm client_order_code để đối soát/tra cứu chéo với GHN. */
	clientOrderCode: string;
	toName: string;
	toPhone: string;
	toAddress: string;
	toWardCode: string;
	toDistrictId: number;
	/** Số tiền GHN thu hộ (COD) khi giao hàng — 0 nếu khách đã thanh toán online. */
	codAmount: number;
	weightGram: number;
	lengthCm: number;
	widthCm: number;
	heightCm: number;
	insuranceValue: number;
	items: CreateShippingOrderItem[];
}

interface CreateShippingOrderResult {
	orderCode: string;
	expectedDeliveryTime: string | null;
}

// Retry lỗi TẠM THỜI khi tạo vận đơn: bản thân GHN đôi khi timeout ở tầng nội bộ của họ (vd log lỗi
// thực tế gặp phải: "Lưu dữ liệu nhạy cảm thất bại: ... context deadline exceeded (Client.Timeout
// exceeded while awaiting headers)") — đây là lỗi thoáng qua phía GHN, không phải do dữ liệu đơn sai,
// nên thử lại ngay thường sẽ thành công mà không cần đợi tới job dọn dẹp định kỳ (xem
// order.service.ts -> retryPendingGhnShipments(), lớp retry thứ 2 cho các lỗi kéo dài hơn vài giây).
const GHN_CREATE_ORDER_MAX_ATTEMPTS = 3; // 1 lần gọi gốc + tối đa 2 lần thử lại
const GHN_CREATE_ORDER_RETRY_DELAY_MS = 1000;

/**
 * Nhận diện lỗi TẠM THỜI (đáng để thử lại) khác với lỗi NGHIỆP VỤ (dữ liệu đơn sai, địa chỉ không
 * hợp lệ, ...) — loại sau thử lại bao nhiêu lần cũng sẽ lỗi y hệt nên không nên retry, chỉ tổ giữ
 * request lâu hơn vô ích:
 *  - Không có `error.response` (lỗi mạng/timeout của chính axios) -> luôn coi là tạm thời.
 *  - GHN trả về HTTP 5xx (lỗi hạ tầng phía họ).
 *  - Message GHN trả về khớp các cụm từ đặc trưng cho sự cố hạ tầng tạm thời (timeout nội bộ, quá
 *    tải) — GHN vẫn trả HTTP 200 kèm code lỗi trong body cho nhiều loại lỗi, nên không thể chỉ dựa
 *    vào status code.
 */
function isTransientGhnError(error: any): boolean {
	if (!error?.response) return true;
	if (error.response.status >= 500) return true;
	const ghnMessage: string = error.response.data?.message ?? "";
	return /context deadline exceeded|deadline exceeded|timeout|time out|quá tải|thử lại sau/i.test(ghnMessage);
}

/**
 * Tạo đơn vận chuyển thật bên GHN (v2/shipping-order/create) ngay sau khi đơn hàng được tạo thành
 * công trong hệ thống — 2 việc này PHẢI đi cùng nhau (xem order.service.ts checkout(), nơi hàm
 * này được gọi bên trong cùng 1 Prisma transaction với việc tạo Order: nếu GHN tạo đơn thất bại,
 * toàn bộ transaction rollback, đơn hàng không được coi là đặt thành công).
 *
 * Điểm lấy hàng ("from") lấy từ thông tin shop cấu hình sẵn ở .env (GHN_FROM_*) — hệ thống hiện
 * chỉ có 1 kho/cửa hàng duy nhất, không hỗ trợ nhiều điểm lấy hàng.
 */
export async function createShippingOrder({
	clientOrderCode,
	toName,
	toPhone,
	toAddress,
	toWardCode,
	toDistrictId,
	codAmount,
	weightGram,
	lengthCm,
	widthCm,
	heightCm,
	insuranceValue,
	items,
}: CreateShippingOrderInput): Promise<CreateShippingOrderResult> {
	let lastError: any;

	// MỚI — vòng lặp retry bao quanh toàn bộ logic gọi GHN cũ (getServiceId + post create)
	for (let attempt = 1; attempt <= GHN_CREATE_ORDER_MAX_ATTEMPTS; attempt++) {
		try {
			const serviceId = await getServiceId(toDistrictId);

			const response = await ghnClient.post(`${env.GHN_API_URL}/v2/shipping-order/create`, {
				client_order_code: clientOrderCode,
				payment_type_id: 1,
				required_note: "CHOXEMHANGKHONGTHU",
				service_id: serviceId,
				to_name: toName,
				to_phone: toPhone,
				to_address: toAddress,
				to_ward_code: toWardCode,
				to_district_id: toDistrictId,
				cod_amount: Math.round(codAmount),
				insurance_value: Math.min(Math.max(insuranceValue, 0), GHN_MAX_INSURANCE_VALUE),
				content: `Đơn hàng ${clientOrderCode}`,
				weight: weightGram,
				length: lengthCm,
				width: widthCm,
				height: heightCm,
				items: items.map((item) => ({ name: item.name, quantity: item.quantity })),
			});

			const orderCode = response.data?.data?.order_code;
			if (typeof orderCode !== "string" || !orderCode) {
				throw new Error("BadRequest: Không nhận được mã vận đơn hợp lệ từ Giao Hàng Nhanh.");
			}

			return { orderCode, expectedDeliveryTime: response.data?.data?.expected_delivery_time ?? null };
		} catch (error: any) {
			lastError = error;

			// Lỗi đã được chuẩn hóa ở nhánh "orderCode không hợp lệ" phía trên -> lỗi nghiệp vụ rõ ràng,
			// không phải lỗi tạm thời -> không retry.
			const isNormalizedBusinessError = error instanceof Error && /^(BadRequest|NotFound|Config):/.test(error.message);

			if (!isNormalizedBusinessError && isTransientGhnError(error) && attempt < GHN_CREATE_ORDER_MAX_ATTEMPTS) {
				console.warn(
					`[ghn] Tạo vận đơn thất bại tạm thời (lần ${attempt}/${GHN_CREATE_ORDER_MAX_ATTEMPTS}) cho đơn ${clientOrderCode}, thử lại sau ${GHN_CREATE_ORDER_RETRY_DELAY_MS}ms:`,
					error?.response?.data?.message ?? error?.message ?? error,
				);
				await sleep(GHN_CREATE_ORDER_RETRY_DELAY_MS * attempt);
				continue;
			}
			break;
		}
	}

	if (lastError instanceof Error && /^(BadRequest|NotFound|Config):/.test(lastError.message)) {
		throw lastError;
	}
	const ghnMessage = lastError?.response?.data?.message;
	throw new Error(`BadRequest: Không thể tạo đơn vận chuyển GHN${ghnMessage ? ` (GHN: ${ghnMessage})` : ""}.`);
}

/**
 * Hủy đơn vận chuyển bên GHN (v2/switch-status/cancel). GHN có thể từ chối hủy nếu đơn đã được
 * lấy hàng/đang giao — khi đó hàm này throw lỗi để order.service.ts KHÔNG cho hủy đơn ở hệ thống
 * mình nữa (giữ đồng bộ trạng thái giữa 2 bên).
 */
export async function cancelShippingOrder(ghnOrderCode: string): Promise<void> {
	try {
		const response = await ghnClient.post(`${env.GHN_API_URL}/v2/switch-status/cancel`, {
			order_codes: [ghnOrderCode],
		});
		const result = response.data?.data?.[0];
		if (!result?.result) {
			throw new Error(`BadRequest: GHN từ chối hủy đơn vận chuyển${result?.message ? ` (${result.message})` : ""} — đơn có thể đã được lấy hàng/đang giao.`);
		}
	} catch (error: any) {
		if (error instanceof Error && /^(BadRequest|NotFound|Config):/.test(error.message)) {
			throw error;
		}
		const ghnMessage = error?.response?.data?.message;
		throw new Error(`BadRequest: Không thể hủy đơn vận chuyển GHN${ghnMessage ? ` (GHN: ${ghnMessage})` : ""}.`);
	}
}
