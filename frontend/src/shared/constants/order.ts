export const ORDER_STATUS = Object.freeze({
	pending: "pending",
	processing: "processing",
	shipped: "shipped",
	delivered: "delivered",
	cancelled: "cancelled",
} as const);

export const PAYMENT_METHOD = Object.freeze({
	cod: "cod",
	vnpay: "vnpay",
	momo: "momo",
	stripe: "stripe",
	paypal: "paypal",
} as const);

export const PAYMENT_STATUS = Object.freeze({
	pending: "pending",
	completed: "completed",
	failed: "failed",
	refunded: "refunded",
} as const);
