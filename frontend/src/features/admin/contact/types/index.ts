import type { Pagination } from "../../../../types";

export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

/**
 * 1 liên hệ nhìn từ phía admin. Không có trường "phone" — model Contact ở
 * backend chỉ còn name/email/subject/message (xem prisma/schema.prisma).
 */
export interface AdminContact {
	id: number;
	userId: number | null;
	name: string;
	email: string;
	subject: string | null;
	message: string;
	status: ContactStatus;
	createdAt: string;
	updatedAt: string;
	/** null nếu khách gửi liên hệ mà không đăng nhập (guest submission). */
	user: { id: number; name: string; email: string } | null;
}

export interface ListContactsParams {
	page?: number;
	limit?: number;
	status?: ContactStatus;
	search?: string;
	userId?: number;
}

export interface ListContactsResult {
	data: AdminContact[];
	pagination: Pagination;
}

export interface UpdateContactStatusPayload {
	id: number;
	status: ContactStatus;
}
