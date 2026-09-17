const permissions = Object.freeze({
	user: {
		read: "user:read",
		write: "user:write",
	},
	rbac: {
		manage: "rbac:manage",
	},
	catalog: {
		read: "catalog:read",
		write: "catalog:write",
	},
	inventory: {
		update: "inventory:update",
	},
	cart: {
		manage: "cart:manage",
	},
	order: {
		create: "order:create",
		read: "order:read",
		update: "order:update",
	},
	coupon: {
		manage: "coupon:manage",
	},
	review: {
		create: "review:create",
		update: "review:update",
	},
	contact: {
		manage: "contact:manage",
		create: "contact:create",
	},
	payment: {
		read: "payment:read",
		manage: "payment:manage",
	},
	dashboard: {
		read: "dashboard:read",
	},
	notification: {
		broadcast: "notification:broadcast",
	},
	transport: {
		manage: "transport:manage",
	},
	conversation: {
		manage: "conversation:manage",
		create: "conversation:create",
	},
	warrantyPolicy: {
		manage: "warranty_policy:manage",
	},
	warrantyClaim: {
		create: "warranty_claim:create",
		manage: "warranty_claim:manage",
	},
} as const);

export default permissions;
