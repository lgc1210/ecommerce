import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import rbacService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";
import type {
	AssignPermissionsPayload,
	CreatePermissionPayload,
	CreateRolePayload,
	Permission,
	RevokePermissionPayload,
	Role,
	RoleDetail,
} from "../types";

export const RBAC_ROLES_QUERY_KEY = ["rbac", "roles"] as const;
export const RBAC_PERMISSIONS_QUERY_KEY = ["rbac", "permissions"] as const;
export const rbacRoleDetailQueryKey = (roleId: number) => ["rbac", "roles", roleId] as const;

/** Danh sách toàn bộ role hệ thống (dùng cho bảng role + dropdown gán role cho user). */
export const useRolesQuery = () => {
	return useQuery<Role[]>({
		queryKey: RBAC_ROLES_QUERY_KEY,
		queryFn: async () => {
			const res = await rbacService.getRoles();
			return res.data.data as Role[];
		},
	});
};

/** Chi tiết 1 role kèm danh sách permission đã gán, dùng cho panel/drawer quản lý permission. */
export const useRoleDetailQuery = (roleId: number | null) => {
	return useQuery<RoleDetail | null>({
		queryKey: roleId ? rbacRoleDetailQueryKey(roleId) : ["rbac", "roles", "none"],
		queryFn: async () => {
			if (!roleId) return null;
			const res = await rbacService.getRoleById(roleId);
			return res.data.data as RoleDetail;
		},
		enabled: Boolean(roleId),
	});
};

/** Danh sách toàn bộ permission hệ thống, nhóm theo resource để hiển thị checklist. */
export const usePermissionsQuery = () => {
	return useQuery<Permission[]>({
		queryKey: RBAC_PERMISSIONS_QUERY_KEY,
		queryFn: async () => {
			const res = await rbacService.getPermissions();
			return res.data.data as Permission[];
		},
	});
};

export const useCreateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateRolePayload) => rbacService.createRole(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: RBAC_ROLES_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo role thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo role thất bại."));
		},
	});
};

export const useCreatePermission = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePermissionPayload) => rbacService.createPermission(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: RBAC_PERMISSIONS_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo quyền thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo quyền thất bại."));
		},
	});
};

/**
 * Gán 1 hoặc nhiều permission cho role. Sau khi thành công, chỉ cần invalidate
 * đúng cache chi tiết của role đó (không cần invalidate danh sách role, vì
 * bảng role không hiển thị permission, chỉ hiển thị số lượng user).
 */
export const useAssignPermissions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: AssignPermissionsPayload) => rbacService.assignPermissions(payload),
		onSuccess: (res, variables) => {
			queryClient.invalidateQueries({ queryKey: rbacRoleDetailQueryKey(variables.roleId) });
			toast.success(res.data.message ?? "Gán quyền thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gán quyền thất bại."));
		},
	});
};

export const useRevokePermission = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RevokePermissionPayload) => rbacService.revokePermission(payload),
		onSuccess: (res, variables) => {
			queryClient.invalidateQueries({ queryKey: rbacRoleDetailQueryKey(variables.roleId) });
			toast.success(res.data.message ?? "Thu hồi quyền thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Thu hồi quyền thất bại."));
		},
	});
};
