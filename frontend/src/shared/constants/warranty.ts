export const DURATION_UNIT = Object.freeze({
	day: "day",
	month: "month",
	year: "year",
} as const);

export type DurationUnit = (typeof DURATION_UNIT)[keyof typeof DURATION_UNIT];

export const WARRANTY_PROVIDER_TYPE = Object.freeze({
	manufacturer: "manufacturer",
	store: "store",
} as const);

export type WarrantyProviderType = (typeof WARRANTY_PROVIDER_TYPE)[keyof typeof WARRANTY_PROVIDER_TYPE];

export const WARRANTY_CLAIM_STATUS = Object.freeze({
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
	in_repair: "in_repair",
	completed: "completed",
	cancelled: "cancelled",
} as const);

export type WarrantyClaimStatus = (typeof WARRANTY_CLAIM_STATUS)[keyof typeof WARRANTY_CLAIM_STATUS];

export const WARRANTY_RESOLUTION_TYPE = Object.freeze({
	repaired: "repaired",
	replaced: "replaced",
	refunded: "refunded",
	no_fault_found: "no_fault_found",
	rejected: "rejected",
} as const);

export type WarrantyResolutionType = (typeof WARRANTY_RESOLUTION_TYPE)[keyof typeof WARRANTY_RESOLUTION_TYPE];
