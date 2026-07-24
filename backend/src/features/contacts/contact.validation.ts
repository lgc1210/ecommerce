import { z } from "zod";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const contactStatusEnum = z.enum(["new", "in_progress", "resolved", "closed"]);

// ==========================================
// Public
// ==========================================
export const CreateContactSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }).max(100),
		email: z.email({ message: "Email không hợp lệ." }).max(255),
		subject: z.string().max(255).optional(),
		message: z
			.string()
			.min(10, { message: "Nội dung phải có ít nhất 10 ký tự." })
			.max(5000, { message: "Nội dung tối đa 5000 ký tự." }),
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
