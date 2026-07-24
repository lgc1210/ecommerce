import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "../constants";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "../types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	[ORDER_STATUS.pending]: "Chờ xử lý",
	[ORDER_STATUS.processing]: "Đang xử lý",
	[ORDER_STATUS.shipped]: "Đang giao",
	[ORDER_STATUS.delivered]: "Đã giao",
	[ORDER_STATUS.cancelled]: "Đã hủy",
};

export const ORDER_STATUS_BADGE_CLASSNAME: Record<OrderStatus, string> = {
	[ORDER_STATUS.pending]: "bg-amber-50 text-amber-600",
	[ORDER_STATUS.processing]: "bg-blue-50 text-blue-600",
	[ORDER_STATUS.shipped]: "bg-violet-50 text-violet-600",
	[ORDER_STATUS.delivered]: "bg-primary-light text-primary-dark",
	[ORDER_STATUS.cancelled]: "bg-red-50 text-red-600",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	[PAYMENT_METHOD.cod]: "Thanh toán khi nhận hàng",
	[PAYMENT_METHOD.vnpay]: "VNPay",
	[PAYMENT_METHOD.momo]: "MoMo",
	[PAYMENT_METHOD.stripe]: "Stripe",
	[PAYMENT_METHOD.paypal]: "PayPal",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
	[PAYMENT_STATUS.pending]: "Chờ thanh toán",
	[PAYMENT_STATUS.completed]: "Đã thanh toán",
	[PAYMENT_STATUS.failed]: "Thất bại",
	[PAYMENT_STATUS.refunded]: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_BADGE_CLASSNAME: Record<PaymentStatus, string> = {
	[PAYMENT_STATUS.pending]: "bg-amber-50 text-amber-600",
	[PAYMENT_STATUS.completed]: "bg-primary-light text-primary-dark",
	[PAYMENT_STATUS.failed]: "bg-red-50 text-red-600",
	[PAYMENT_STATUS.refunded]: "bg-ink/10 text-ink/60",
};

/**
 * Mirror của ALLOWED_TRANSITIONS ở backend (order.utils.ts:isValidOrderStatusTransition)
 * — chỉ dùng để giới hạn option hiển thị trong dropdown đổi trạng thái cho gọn UX (ẩn
 * bớt bước chuyển vô nghĩa, vd. không cho chọn "pending" khi đơn đang "shipped").
 * Backend vẫn là nơi validate thật sự, FE không tự ý tin tưởng 100% để tránh lệch logic
 * nếu 2 bên không đồng bộ. "delivered"/"cancelled" là trạng thái cuối, không có bước chuyển tiếp.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	[ORDER_STATUS.pending]: [ORDER_STATUS.processing, ORDER_STATUS.cancelled],
	[ORDER_STATUS.processing]: [ORDER_STATUS.shipped, ORDER_STATUS.cancelled],
	[ORDER_STATUS.shipped]: [ORDER_STATUS.delivered, ORDER_STATUS.cancelled],
	[ORDER_STATUS.delivered]: [],
	[ORDER_STATUS.cancelled]: [],
};

export const getNextOrderStatusOptions = (current: OrderStatus): OrderStatus[] => {
	console.log("=== DEBUG getNextOrderStatusOptions ===");
	console.log("current =", current);
	console.log("typeof current =", typeof current);
	console.log("ALLOWED_TRANSITIONS =", ALLOWED_TRANSITIONS);
	console.log("Object.keys(ALLOWED_TRANSITIONS) =", Object.keys(ALLOWED_TRANSITIONS));
	console.log("ALLOWED_TRANSITIONS[current] =", ALLOWED_TRANSITIONS[current]);
	return [current, ...ALLOWED_TRANSITIONS[current]];
};

/** true nếu đơn đang ở trạng thái cuối (không thể đổi trạng thái được nữa). */
export const isTerminalOrderStatus = (status: OrderStatus): boolean => ALLOWED_TRANSITIONS[status].length === 0;

export const formatOrderDate = (value: string) =>
	new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
