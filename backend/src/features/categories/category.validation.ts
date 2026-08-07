import { z } from "zod";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ==========================================
// Public
// ==========================================
export const ListCategoriesQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(255).optional(),
		parentId: z.union([z.string().regex(/^\d+$/), z.literal("null")]).optional(),
		tree: z.enum(["true", "false"]).optional(),
	}),
});

export const FeaturedCategoriesQuerySchema = z.object({
	query: z.object({
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});

export const CategorySlugParamSchema = z.object({
	params: z.object({
		slug: z.string().min(1, { message: "Slug không hợp lệ." }).max(100),
	}),
});

// ==========================================
// Admin
// ==========================================
export const CreateCategorySchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự." }).max(100),
		slug: z.string().min(2).max(100).regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." }).optional(),
		description: z.string().max(5000).optional(),
		parentId: z.number().int().positive().nullable().optional(),
		isFeatured: z.boolean().optional(),
	}),
});

export const UpdateCategorySchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			name: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự." }).max(100).optional(),
			slug: z.string().min(2).max(100).regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." }).optional(),
			description: z.string().max(5000).optional(),
			parentId: z.number().int().positive().nullable().optional(),
			isFeatured: z.boolean().optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const CategoryIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});
