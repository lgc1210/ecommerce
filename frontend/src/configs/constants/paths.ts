const paths = Object.freeze({
	auth: {
		login: "/login",
		register: "/register",
		forgotPassword: "/forgot-password",
		resetPassword: "/reset-password",
		verifyOtp: "/verify-otp",
	},
	client: {
		home: "/",
		about: "/about",
		cart: "/cart",
		payment: "/payment",
		paymentResult: "/payment/result",
		shop: "/shop",
		contact: "/contact",
		account: "/account",
		productDetail: (slug: string) => `/product/${slug}`,
	},
	admin: {
		dashboard: "/admin",
		category: "/admin/category",
		product: "/admin/product",
		productDetail: (id: number | string) => `/admin/product/${id}`,
		order: "/admin/order",
		payment: "/admin/payment",
		coupon: "/admin/coupon",
		user: "/admin/user",
		role: "/admin/role",
		contact: "/admin/contact",
	},
	errors: {
		forbidden: "/403",
	},
} as const);

export default paths;
