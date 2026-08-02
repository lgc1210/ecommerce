export const PAYMENT_STATUS = Object.freeze({
	pending: "pending",
	completed: "completed",
	failed: "failed",
	refunded: "refunded",
} as const);

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
