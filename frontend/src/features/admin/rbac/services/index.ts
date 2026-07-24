import apiClient from "../../../../configs/apis";
import type {
	AssignPermissionsPayload,
	CreatePermissionPayload,
	CreateRolePayload,
	RevokePermissionPayload,
} from "../types";

const rbacService = {
	// ---------- Roles ----------
	getRoles: async () => apiClient.get("/rbac/roles"),
	getRoleById: async (roleId: number) => apiClient.get(`/rbac/roles/${roleId}`),
	createRole: async (payload: CreateRolePayload) => apiClient.post("/rbac/roles", payload),

	// ---------- Permissions ----------
	getPermissions: async () => apiClient.get("/rbac/permissions"),
	createPermission: async (payload: CreatePermissionPayload) => apiClient.post("/rbac/permissions", payload),

	// ---------- Role <-> Permission linking ----------
	assignPermissions: async ({ roleId, permissionIds }: AssignPermissionsPayload) =>
		apiClient.post(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
	revokePermission: async ({ roleId, permissionId }: RevokePermissionPayload) =>
		apiClient.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`),
};

export default rbacService;
