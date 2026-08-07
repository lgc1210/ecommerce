import { GHN_CANCELLED_STATUSES, GHN_DELIVERED_STATUSES, GHN_PROCESSING_STATUSES, GHN_SHIPPED_STATUSES } from "../../external/ghn/ghn.constant.js";
import { OrderStatus } from "../../generated/prisma/index.js";

/** Các bước chuyển trạng thái đơn hàng hợp lệ. Trạng thái "delivered"/"cancelled" là trạng thái cuối, không đổi được nữa. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	[OrderStatus.pending]: [OrderStatus.processing, OrderStatus.cancelled],
	[OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
	[OrderStatus.shipped]: [OrderStatus.delivered, OrderStatus.cancelled],
	[OrderStatus.delivered]: [],
	[OrderStatus.cancelled]: [],
};

/** Kiểm tra việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không */
export function isValidOrderStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
	if (current === next) return true;
	return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

/** Đơn hàng chỉ được phép khôi phục tồn kho / lượt dùng coupon đúng 1 lần, khi vừa chuyển SANG "cancelled" */
export function isCancellation(previous: OrderStatus, next: OrderStatus): boolean {
	return previous !== OrderStatus.cancelled && next === OrderStatus.cancelled;
}

/**
 * Sinh mã đơn hàng hiển thị cho khách, vd: "ORD-20260710-4821".
 * Không đảm bảo tuyệt đối duy nhất (va chạm gần như không thể xảy ra nhờ timestamp + random),
 * nhưng service vẫn nên bắt lỗi unique constraint từ DB để an toàn tuyệt đối.
 */
export function generateOrderNumber(now: Date = new Date()): string {
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
	const randomPart = Math.floor(1000 + Math.random() * 9000);
	return `ORD-${datePart}-${randomPart}`;
}

/**
 * Map trạng thái GHN (webhook) sang OrderStatus nội bộ. Trả về null nếu trạng thái đó chưa đủ rõ
 * ràng để tự ý chuyển trạng thái đơn (vd: "waiting_to_return") — những trường hợp này chỉ nên lưu
 * lại ghn_status thô để tham khảo.
 */
export function mapGhnStatusToOrderStatus(ghnStatus: string): OrderStatus | null {
	if (GHN_DELIVERED_STATUSES.has(ghnStatus)) return OrderStatus.delivered;
	if (GHN_CANCELLED_STATUSES.has(ghnStatus)) return OrderStatus.cancelled;
	if (GHN_SHIPPED_STATUSES.has(ghnStatus)) return OrderStatus.shipped;
	if (GHN_PROCESSING_STATUSES.has(ghnStatus)) return OrderStatus.processing;
	return null;
}

interface WeighableCartItem {
	quantity: number;
	productSku: { weightGram: number; lengthCm: number; widthCm: number; heightCm: number };
}

/**
 * Tính khối lượng (gram) + kích thước đóng gói (cm) ước lượng của giỏ hàng để gửi cho GHN tính
 * phí vận chuyển, dựa trên khối lượng/kích thước THẬT của từng biến thể (ProductSku.weightGram/
 * lengthCm/widthCm/heightCm — admin nhập khi tạo/sửa biến thể), không còn dùng giá trị mặc định
 * cấu hình cứng ở .env.
 *
 * Đây chỉ là ước lượng đơn giản, không phải thuật toán đóng gói (bin packing) thật: chiều dài/
 * rộng lấy giá trị LỚN NHẤT trong các sản phẩm (giả định xếp cạnh nhau trong cùng 1 kiện), chiều
 * cao CỘNG DỒN theo số lượng (giả định xếp chồng lên nhau). Khối lượng luôn cộng dồn chính xác.
 */
export function computeCartPackage(items: WeighableCartItem[]) {
	let weightGram = 0;
	let lengthCm = 0;
	let widthCm = 0;
	let heightCm = 0;

	for (const item of items) {
		weightGram += item.quantity * item.productSku.weightGram;
		lengthCm = Math.max(lengthCm, item.productSku.lengthCm);
		widthCm = Math.max(widthCm, item.productSku.widthCm);
		heightCm += item.quantity * item.productSku.heightCm;
	}

	// GHN yêu cầu các giá trị này > 0
	return {
		weightGram: Math.max(weightGram, 1),
		lengthCm: Math.max(lengthCm, 1),
		widthCm: Math.max(widthCm, 1),
		heightCm: Math.max(heightCm, 1),
	};
}
