/** Kết quả kiểm tra/áp mã giảm giá (POST /coupons/validate), dùng ở trang thanh toán. */
export interface ValidateCouponResult {
	couponId: number;
	code: string;
	discountAmount: number;
	finalAmount: number;
}

/** Kết quả đăng ký nhận mã giảm giá chào mừng đơn hàng đầu tiên (POST /coupons/request-welcome). */
export interface RequestWelcomeCouponResult {
	email: string;
	code: string;
	expiresAt: string;
}
