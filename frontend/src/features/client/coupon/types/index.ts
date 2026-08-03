/** Kết quả kiểm tra/áp mã giảm giá (POST /coupons/validate), dùng ở trang thanh toán. */
export interface ValidateCouponResult {
	couponId: number;
	code: string;
	discountAmount: number;
	finalAmount: number;
}
