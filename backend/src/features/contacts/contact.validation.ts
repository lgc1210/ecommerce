import { z } from "zod";
import { ContactStatus } from "../../generated/prisma/index.js";
import { numericIdString } from "../../shared/validation.js";

const contactStatusEnum = z.enum([ContactStatus.new, ContactStatus.in_progress, ContactStatus.resolved, ContactStatus.closed]);

// ==========================================
// Public
// ==========================================
export const CreateContactSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }).max(100),
		email: z.email({ message: "Email không hợp lệ." }).max(255),
		subject: z.string().max(255).optional(),
		message: z.string().min(10, { message: "Nội dung phải có ít nhất 10 ký tự." }).max(5000, { message: "Nội dung tối đa 5000 ký tự." }),
	}),
});

// ==========================================
// Self-service (khách hàng đã đăng nhập xem lại các liên hệ của chính mình)
// ==========================================
export const ListOwnContactsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});

// ==========================================
// Admin
// ==========================================
export const ListContactsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: contactStatusEnum.optional(),
		search: z.string().max(255).optional(),
		userId: z.string().regex(/^\d+$/).optional(),
	}),
});

export const ContactIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const UpdateContactStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({
		status: contactStatusEnum,
	}),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>["body"];
export type ListOwnContactsParams = z.infer<typeof ListOwnContactsQuerySchema>["query"];
export type ListContactsParams = z.infer<typeof ListContactsQuerySchema>["query"];
export type UpdateContactStatusInput = z.infer<typeof UpdateContactStatusSchema>["body"];
