import type { Pagination } from "../../../../types";

export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

/**
 * Payload gửi form liên hệ công khai (POST /contacts). Khớp với
 * CreateContactSchema ở backend: chỉ "name", "email", "message" là bắt buộc;
 * "phone"/"subject" là optional nên không được set giá trị rỗng "" (Zod
 * .optional() không coi "" là hợp lệ với .email()/.regex(), phải omit hẳn field).
 * Không cần "user_id": backend tự lấy từ req.user (JWT) nếu khách đang đăng nhập.
 */
export interface ContactPayload {
	name: string;
	email: string;
	subject: string;
	message: string;
}

/** 1 liên hệ do chính user hiện tại gửi trước đó (GET /contacts/me). */
export interface MyContact {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	subject: string | null;
	message: string;
	status: ContactStatus;
	createdAt: string;
}

export interface MyContactsResult {
	data: MyContact[];
	pagination: Pagination;
}
