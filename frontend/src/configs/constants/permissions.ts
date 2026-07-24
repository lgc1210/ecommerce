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
} as const);

export default permissions;
