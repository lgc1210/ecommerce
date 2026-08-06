export const PAYMENT_METHOD = Object.freeze({
	cod: "cod",
	vnpay: "vnpay",
	zalopay: "zalopay",
	momo: "momo",
	stripe: "stripe",
	paypal: "paypal",
} as const);

/** Các phương thức thanh toán đi qua cổng online thật (redirect khách sang trang gateway) — khác
 * với "cod" (thu tiền mặt khi giao) và momo/stripe/paypal (chưa triển khai, hiển thị UI nhưng
 * BE sẽ trả lỗi nếu chọn). Dùng để quyết định có cần gọi `POST /payments/me/:orderId/pay` để lấy
 * URL redirect sau khi đặt hàng hay không (xem pages/client/payment.tsx). */
export const ONLINE_GATEWAY_METHODS: readonly string[] = [PAYMENT_METHOD.vnpay, PAYMENT_METHOD.zalopay];

export const PAYMENT_STATUS = Object.freeze({
	pending: "pending",
	completed: "completed",
	failed: "failed",
	refunded: "refunded",
} as const);
