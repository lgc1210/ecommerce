/** Permission dạng "resource:name" tách rời (vd. resource="catalog", name="write"). */
export interface Permission {
	id: number;
	resource: string;
	name: string;
	description: string | null;
	createdAt?: string;
}

/** Role trả về từ danh sách (GET /rbac/roles), kèm số lượng user đang gán role này. */
export interface Role {
	id: number;
	name: string;
	description: string | null;
	createdAt?: string;
	updatedAt?: string;
	_count: { users: number };
}

/** Role trả về từ chi tiết (GET /rbac/roles/:roleId), kèm danh sách permission đã gán. */
export interface RoleDetail extends Role {
	permissions: Permission[];
}

export interface CreateRolePayload {
	name: string;
	description?: string;
}

export interface CreatePermissionPayload {
	resource: string;
	name: string;
	description?: string;
}

export interface AssignPermissionsPayload {
	roleId: number;
	permissionIds: number[];
}

export interface RevokePermissionPayload {
	roleId: number;
	permissionId: number;
}
