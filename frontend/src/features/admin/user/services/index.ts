import apiClient from "../../../../configs/apis";
import type { CreateUserPayload, ListUsersParams, UpdateUserRolePayload, UpdateUserStatusPayload } from "../types";

/**
 * Endpoint quản trị user được mount tại "/api/users" (xem backend app.ts:
 * app.use("/api/users", userRouter)), KHÔNG phải "/api/admin/users".
 */
const userService = {
	getUsers: async (params: ListUsersParams = {}) =>
		apiClient.get("/users", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
				roleId: params.roleId,
				isActive: params.isActive === undefined ? undefined : String(params.isActive),
			},
		}),
	getUserById: async (id: number) => apiClient.get(`/users/${id}`),
	updateUserRole: async ({ id, roleId }: UpdateUserRolePayload) => apiClient.patch(`/users/${id}/role`, { roleId }),
	updateUserStatus: async ({ id, isActive }: UpdateUserStatusPayload) =>
		apiClient.patch(`/users/${id}/status`, { isActive }),
	createUser: async (payload: CreateUserPayload) => apiClient.post("/users", payload),
};

export default userService;
