import { PAYMENT_METHOD, PAYMENT_STATUS, type PaymentMethod, type PaymentStatus } from "../../../../shared/constants/payment";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	[PAYMENT_METHOD.cod]: "Thanh toán khi nhận hàng",
	[PAYMENT_METHOD.vnpay]: "VNPay",
	[PAYMENT_METHOD.zalopay]: "ZaloPay",
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
 * Mirror của ALLOWED_TRANSITIONS ở backend (payment.utils.ts:isValidPaymentStatusTransition)
 * — chỉ dùng để giới hạn option hiển thị trong dropdown đổi trạng thái cho gọn UX. Backend
 * vẫn là nơi validate thật sự (transitionStatus trong payment.service.ts), FE không tự ý tin
 * tưởng 100% để tránh lệch logic nếu 2 bên không đồng bộ.
 *
 * pending -> completed | failed
 * failed -> pending (cho phép thử lại)
 * completed -> refunded
 * refunded là trạng thái cuối.
 */
const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
	[PAYMENT_STATUS.pending]: [PAYMENT_STATUS.completed, PAYMENT_STATUS.failed],
	[PAYMENT_STATUS.failed]: [PAYMENT_STATUS.pending],
	[PAYMENT_STATUS.completed]: [PAYMENT_STATUS.refunded],
	[PAYMENT_STATUS.refunded]: [],
};

export const getNextPaymentStatusOptions = (current: PaymentStatus): PaymentStatus[] => {
	return [current, ...ALLOWED_TRANSITIONS[current]];
};

/** true nếu payment đang ở trạng thái cuối (không thể đổi được nữa). */
export const isTerminalPaymentStatus = (status: PaymentStatus): boolean => ALLOWED_TRANSITIONS[status].length === 0;
