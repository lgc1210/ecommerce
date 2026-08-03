import { ghnClient } from "../../config/axios.js";
import { env } from "../../config/dotenv.js";

// GHN giới hạn giá trị khai báo bảo hiểm (insurance_value) tối đa 5.000.000đ ở mức phí cơ bản;
// vượt mức này cần phụ phí bảo hiểm mở rộng mà hệ thống hiện chưa hỗ trợ, nên tạm chặn ở mức trần này.
const GHN_MAX_INSURANCE_VALUE = 5_000_000;

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

	// Ưu tiên gói "Chuẩn" (service_type_id = 2, tính cước theo khối lượng thực) cho hàng nhẹ thông
	// thường; nếu tuyến này không có gói Chuẩn thì lấy gói đầu tiên GHN trả về.
	const preferred = services.find((service) => service.service_type_id === 2) ?? services[0]!;
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
export async function calculateShippingFee({
	toDistrictId,
	toWardCode,
	weightGram,
	lengthCm,
	widthCm,
	heightCm,
	insuranceValue,
}: CalculateShippingFeeInput): Promise<number> {
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
		throw new Error(
			`BadRequest: Không thể tính phí vận chuyển cho địa chỉ này${ghnMessage ? ` (GHN: ${ghnMessage})` : ""}.`,
		);
	}
}
