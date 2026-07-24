import type { Pagination } from "../../../../types";

export interface AdminUser {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	roleId: number;
	provider: string;
	isActive: boolean;
	isVerified: boolean;
	createdAt?: string;
	updatedAt?: string;
	/** Có từ include: { role: { select: { id, name } } } ở backend. */
	role: { id: number; name: string };
}

export interface ListUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	roleId?: number;
	isActive?: boolean;
}

export interface ListUsersResult {
	data: AdminUser[];
	pagination: Pagination;
}

export interface UpdateUserRolePayload {
	id: number;
	roleId: number;
}

export interface UpdateUserStatusPayload {
	id: number;
	isActive: boolean;
}

export interface CreateUserPayload {
	name: string;
	email: string;
	phone: string;
	roleId: number;
}
