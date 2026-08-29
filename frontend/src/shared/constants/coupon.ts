export const DISCOUNT_TYPE = Object.freeze({
	percent: "percentage",
	fixed: "fixed",
} as const);

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];
