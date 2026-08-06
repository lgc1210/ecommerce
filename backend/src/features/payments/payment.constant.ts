export const PAYMENT_METHOD = Object.freeze({
	cod: "cod",
	vnpay: "vnpay",
	zalopay: "zalopay",
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

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
