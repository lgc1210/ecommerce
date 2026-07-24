import { ORDER_STATUS } from "./order.constant.js";

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Các bước chuyển trạng thái đơn hàng hợp lệ. Trạng thái "delivered"/"cancelled" là trạng thái cuối, không đổi được nữa. */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	[ORDER_STATUS.pending]: [ORDER_STATUS.processing, ORDER_STATUS.cancelled],
	[ORDER_STATUS.processing]: [ORDER_STATUS.shipped, ORDER_STATUS.cancelled],
	[ORDER_STATUS.shipped]: [ORDER_STATUS.delivered, ORDER_STATUS.cancelled],
	[ORDER_STATUS.delivered]: [],
	[ORDER_STATUS.cancelled]: [],
};

/** Kiểm tra việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không */
export function isValidOrderStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
	if (current === next) return true;
	return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

/** Đơn hàng chỉ được phép khôi phục tồn kho / lượt dùng coupon đúng 1 lần, khi vừa chuyển SANG "cancelled" */
export function isCancellation(previous: OrderStatus, next: OrderStatus): boolean {
	return previous !== ORDER_STATUS.cancelled && next === ORDER_STATUS.cancelled;
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
 * Tính phí vận chuyển mặc định theo giá trị đơn hàng (chưa có feature vận chuyển riêng):
 * Miễn phí ship từ 500.000đ trở lên, dưới mức đó thu phí cố định 30.000đ.
 */
export function computeShippingFee(subtotal: number): number {
	const FREE_SHIPPING_THRESHOLD = 500_000;
	const FLAT_SHIPPING_FEE = 30_000;
	return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}
