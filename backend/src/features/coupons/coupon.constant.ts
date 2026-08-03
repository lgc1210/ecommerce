export const DISCOUNT_TYPE = Object.freeze({
	fixed: "fixed",
	percentage: "percentage",
} as const);

/** Cấu hình cho coupon "chào mừng đơn hàng đầu tiên" tạo từ form đăng ký email ở trang chủ. */
export const WELCOME_COUPON = Object.freeze({
	// Tiền tố để nhận diện + tránh trùng với coupon do admin tự đặt tay
	codePrefix: "WELCOMEFIRST",
	discountType: DISCOUNT_TYPE.percentage,
	discountValue: 25, // Khớp nội dung banner trang chủ: "ưu đãi 25% cho đơn hàng đầu tiên"
	maxDiscountValue: 100000,
	minOrderValue: 0,
	usageLimit: 1,
	validityDays: 30,
} as const);
