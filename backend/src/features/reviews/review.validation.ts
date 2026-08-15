import { z } from "zod";
import { numericIdString } from "../../shared/validation.js";
import { reviewSortOptions } from "./review.constant.js";

// ==========================================
// Public
// ==========================================
export const ListReviewsByProductQuerySchema = z.object({
	params: z.object({ productId: numericIdString }),
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		rating: z
			.string()
			.regex(/^[1-5]$/)
			.optional(),
		sort: z.enum(reviewSortOptions).optional(),
	}),
});

// ==========================================
// Customer
// ==========================================
export const CreateReviewSchema = z.object({
	body: z.object({
		productId: z.number().int().positive({ message: "productId không hợp lệ." }),
		rating: z.number().int().min(1, { message: "Điểm đánh giá phải từ 1 đến 5." }).max(5, { message: "Điểm đánh giá phải từ 1 đến 5." }),
		comment: z.string().max(2000, { message: "Nhận xét tối đa 2000 ký tự." }).optional(),
	}),
});

export const UpdateReviewSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			rating: z.number().int().min(1, { message: "Điểm đánh giá phải từ 1 đến 5." }).max(5, { message: "Điểm đánh giá phải từ 1 đến 5." }).optional(),
			comment: z.string().max(2000, { message: "Nhận xét tối đa 2000 ký tự." }).nullable().optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const ReviewIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

// ==========================================
// Admin / Moderation
// ==========================================
export const ListReviewsAdminQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		productId: z.string().regex(/^\d+$/).optional(),
		userId: z.string().regex(/^\d+$/).optional(),
		rating: z
			.string()
			.regex(/^[1-5]$/)
			.optional(),
		search: z.string().max(255).optional(),
	}),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>["body"];
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>["body"];
