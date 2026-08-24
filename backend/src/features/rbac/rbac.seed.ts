import prisma from "../../config/prisma.js";
import rbacService from "./rbac.service.js";

export const roleSeed = async () => {
	const roles = await prisma.role.count();
	if (roles > 0) return;
	await rbacService.createRole("admin", "System Administrator");
	await rbacService.createRole("customer", "Customer");
	await rbacService.createRole("manager", "Manager");
	console.log("Seeding: Roles created successfully");
};

// LƯU Ý: `resource` + `name` phải khớp CHÍNH XÁC với cách requirePermission("<resource>:<name>")
// tách chuỗi (vd: requirePermission("catalog:write") -> resource="catalog", name="write").
// Không truyền cả cụm "catalog:write" vào tham số `name`, sẽ không bao giờ khớp khi middleware tra cứu.
export const permissionSeed = async () => {
	const permissions = await prisma.permission.count();
	if (permissions > 0) return;
	await rbacService.createPermission("user", "read", "View customer listings, ban/unban users, update system staff accounts.");
	await rbacService.createPermission("user", "write", "View customer listings, ban/unban users, update system staff accounts.");
	await rbacService.createPermission("rbac", "manage", "Create new roles or modify permissions assigned to standard staff.");
	await rbacService.createPermission("catalog", "read", "Browse active products, categories, and SKUs (Public permission).");
	await rbacService.createPermission("catalog", "write", "Create, update, delete, or deactivate products, categories, and variants.");
	await rbacService.createPermission("inventory", "update", "Update warehouse stock counts manually without changing pricing details.");
	await rbacService.createPermission("cart", "manage", "Read and write actions on own cart items (Owned data check).");
	await rbacService.createPermission("order", "create", "Place a new order and execute checkout (Customer action).");
	await rbacService.createPermission("order", "read", "View personal order logs. Staff can view all customer orders.");
	await rbacService.createPermission("order", "update", "Update order processing states (e.g., changing status from pending to shipped).");
	await rbacService.createPermission("coupon", "manage", "Generate promotional campaign codes, modify values, or expire codes.");
	await rbacService.createPermission("review", "create", "Submit product ratings and feedback logs (Customer action).");
	await rbacService.createPermission("review", "update", "Delete spam comments or inappropriate text entries from the public site.");
	await rbacService.createPermission("contact", "manage", "View, update status, or delete customer contact/support submissions.");
	await rbacService.createPermission("contact", "create", "Submit contact information (Customer action).");
	await rbacService.createPermission("payment", "read", "View payment records and transaction statuses for any order (Admin).");
	await rbacService.createPermission("payment", "manage", "Update payment status manually (e.g., mark as paid, refunded, failed).");
	await rbacService.createPermission("dashboard", "read", "View admin dashboard overview, revenue charts, and system statistics.");
	await rbacService.createPermission("notification", "broadcast", "Send system/promotion notifications to one or more users (Admin/Manager).");
	await rbacService.createPermission("transport", "manage", "Managing GHN transport services.");
	console.log("Seeding: Permissions created successfully");
};

// Danh sách permission ("resource:name") mặc định cấp cho từng role.
// admin luôn nhận TOÀN BỘ permission hiện có trong hệ thống (tính động, không hardcode danh sách).
const managerPermissionKeys = [
	"catalog:read",
	"catalog:write",
	"inventory:update",
	"order:read",
	"order:update",
	"coupon:manage",
	"review:update",
	"user:read",
	"contact:manage",
	"contact:create",
	"payment:read",
	"dashboard:read",
	"notification:broadcast",
];

const customerPermissionKeys = ["catalog:read", "cart:manage", "order:create", "order:read", "review:create", "contact:create"];

/**
 * Gán permission mặc định cho từng role (admin/manager/customer).
 * Phải chạy SAU roleSeed() và permissionSeed(). Chỉ chạy khi bảng role_permissions hoàn toàn trống,
 * để không ghi đè phân quyền đã được admin tùy chỉnh thủ công qua API rbac:manage.
 */
export const rolePermissionSeed = async () => {
	const existingLinks = await prisma.rolePermission.count();
	if (existingLinks > 0) return;

	const [roles, permissions] = await Promise.all([prisma.role.findMany(), prisma.permission.findMany()]);

	const roleIdByName = new Map(roles.map((r) => [r.name, r.id]));
	const permissionIdByKey = new Map(permissions.map((p) => [`${p.resource}:${p.name}`, p.id]));

	const resolveIds = (keys: string[]) => keys.map((key) => permissionIdByKey.get(key)).filter((id): id is number => id !== undefined);

	const rolePermissionMap: Record<string, number[]> = {
		admin: permissions.map((p) => p.id),
		manager: resolveIds(managerPermissionKeys),
		customer: resolveIds(customerPermissionKeys),
	};

	for (const [roleName, permissionIds] of Object.entries(rolePermissionMap)) {
		const roleId = roleIdByName.get(roleName);
		if (!roleId || permissionIds.length === 0) continue;
		await rbacService.assignPermissionsToRole(roleId, permissionIds);
	}

	console.log("Seeding: Role-permission assignments created successfully");
};
