import type { PaymentStatus } from "../../generated/prisma/index.js";
import { PAYMENT_STATUS } from "./payment.constant.js";

/**
 * Các bước chuyển trạng thái thanh toán hợp lệ:
 * pending -> completed (khách/cổng thanh toán xác nhận thành công) hoặc failed (giao dịch thất bại)
 * failed -> pending (cho phép thử lại thanh toán)
 * completed -> refunded (hoàn tiền sau khi đã thanh toán thành công)
 * refunded là trạng thái cuối, không đổi được nữa.
 */
const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
	[PAYMENT_STATUS.pending]: [PAYMENT_STATUS.completed, PAYMENT_STATUS.failed],
	[PAYMENT_STATUS.failed]: [PAYMENT_STATUS.pending],
	[PAYMENT_STATUS.completed]: [PAYMENT_STATUS.refunded],
	[PAYMENT_STATUS.refunded]: [],
};

/** Kiểm tra việc chuyển từ trạng thái thanh toán hiện tại sang trạng thái mới có hợp lệ hay không */
export function isValidPaymentStatusTransition(current: PaymentStatus, next: PaymentStatus): boolean {
	if (current === next) return true;
	return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

/** Đơn hàng chỉ nên được hoàn tồn kho/coupon đúng 1 lần, khi thanh toán vừa chuyển SANG "refunded" */
export function isRefund(previous: PaymentStatus, next: PaymentStatus): boolean {
	return previous !== PAYMENT_STATUS.refunded && next === PAYMENT_STATUS.refunded;
}
