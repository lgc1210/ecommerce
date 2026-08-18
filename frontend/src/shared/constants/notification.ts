export const NOTIFICATION_TYPE = Object.freeze({
	order: "order",
	payment: "payment",
	stock: "stock",
	review: "review",
	promotion: "promotion",
	system: "system",
} as const);

export const BROADCAST_NOTIFICATION_TYPE = Object.freeze({
	[NOTIFICATION_TYPE.promotion]: "promotion",
	[NOTIFICATION_TYPE.system]: "system",
});
