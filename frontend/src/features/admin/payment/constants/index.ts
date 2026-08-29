import { PAYMENT_METHOD } from "../../../../shared/constants/payment";

/**
 * CHÚ Ý: `paymentMethodEnum` dùng để validate query `method` ở
 * backend/src/features/payments/payment.validation.ts (ListPaymentsAdminQuerySchema)
 * hiện KHÔNG có "zalopay" (chỉ cod/vnpay/momo/stripe/paypal) — dù bản thân 1 payment
 * vẫn có thể mang paymentMethod = "zalopay" (đơn đặt qua ZaloPay). Nếu gửi
 * `?method=zalopay` lên, backend sẽ trả 400 Bad Request.
 *
 * Đây là giới hạn thật của backend hiện tại (không phải lỗi ở FE) — dropdown lọc
 * theo phương thức dưới đây CHỦ Ý bỏ "zalopay" để khớp đúng, còn khi HIỂN THỊ
 * (badge/label trong bảng, modal chi tiết) vẫn dùng đủ PAYMENT_METHOD_LABEL cho
 * cả 6 giá trị vì payment thật có thể là zalopay.
 */
export const PAYMENT_METHOD_FILTER_OPTIONS = [PAYMENT_METHOD.cod, PAYMENT_METHOD.vnpay, PAYMENT_METHOD.zalopay, PAYMENT_METHOD.momo, PAYMENT_METHOD.stripe, PAYMENT_METHOD.paypal] as const;
