import { z } from "zod";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ==========================================
// SKU (biến thể) - dùng chung cho tạo/sửa
// ==========================================
const SkuInputSchema = z.object({
	sku: z.string().min(1, { message: "Mã SKU không được để trống." }).max(50).optional(), // Bỏ trống -> hệ thống tự sinh mã SKU từ tên sản phẩm + biến thể
	price: z.number().positive({ message: "Giá phải lớn hơn 0." }),
	stockQuantity: z.number().int().min(0, { message: "Tồn kho không được âm." }).optional(),
	variationDetails: z.record(z.string(), z.any()).refine((obj) => Object.keys(obj).length > 0, {
		message: "Cần ít nhất 1 thuộc tính biến thể (vd: color, size).",
	}),
});

// ==========================================
// Public
// ==========================================
export const ListProductsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(255).optional(),
		categoryId: z.string().regex(/^\d+$/).optional(),
		minPrice: z
			.string()
			.regex(/^\d+(\.\d+)?$/)
			.optional(),
		maxPrice: z
			.string()
			.regex(/^\d+(\.\d+)?$/)
			.optional(),
		sort: z.enum(["newest", "name_asc", "name_desc"]).optional(),
		// Chỉ admin route mới thực sự áp dụng cờ này (public route luôn ép isActive=true)
		isActive: z.enum(["true", "false"]).optional(),
	}),
});

export const ProductSlugParamSchema = z.object({
	params: z.object({
		slug: z.string().min(1, { message: "Slug không hợp lệ." }).max(100),
	}),
});

// ==========================================
// Admin - Product
// ==========================================
export const CreateProductSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự." }).max(100),
		slug: z
			.string()
			.min(2)
			.max(100)
			.regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." })
			.optional(),
		description: z.string().max(5000).optional(),
		categoryId: z.number().int().positive().nullable().optional(),
		isActive: z.boolean().optional(),
		// URL trả về từ POST /uploads/product-image sau khi admin chọn ảnh thumbnail từ máy
		thumbnailUrl: z.string().max(500).url({ message: "thumbnailUrl phải là một URL hợp lệ." }).optional(),
		skus: z.array(SkuInputSchema).optional(),
	}),
});

export const UpdateProductSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			name: z.string().min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự." }).max(100).optional(),
			slug: z
				.string()
				.min(2)
				.max(100)
				.regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." })
				.optional(),
			description: z.string().max(5000).optional(),
			categoryId: z.number().int().positive().nullable().optional(),
			isActive: z.boolean().optional(),
			thumbnailUrl: z.url({ message: "thumbnailUrl phải là một URL hợp lệ." }).nullable().optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const ProductIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

// ==========================================
// Admin - Product SKU (biến thể)
// ==========================================
export const CreateSkuSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: SkuInputSchema,
});

export const UpdateSkuSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString }),
	body: z
		.object({
			sku: SkuInputSchema.shape.sku.optional(),
			price: SkuInputSchema.shape.price.optional(),
			stockQuantity: SkuInputSchema.shape.stockQuantity,
			variationDetails: SkuInputSchema.shape.variationDetails.optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const SkuParamSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString }),
});

export const UpdateStockSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString }),
	body: z.object({
		stockQuantity: z.number().int().min(0, { message: "Tồn kho không được âm." }),
	}),
});

// ==========================================
// Admin - Product SKU Images (ảnh theo từng biến thể)
// ==========================================
export const CreateSkuImageSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString }),
	body: z.object({
		imageUrl: z
			.string()
			.min(1, { message: "imageUrl không được để trống." })
			.max(500)
			.url({ message: "imageUrl phải là một URL hợp lệ." }),
		altText: z.string().max(255).optional(),
		isPrimary: z.boolean().optional(),
		sortOrder: z.number().int().min(0).optional(),
	}),
});

export const UpdateSkuImageSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString, imageId: numericIdString }),
	body: z
		.object({
			imageUrl: z.string().min(1).max(500).url({ message: "imageUrl phải là một URL hợp lệ." }).optional(),
			altText: z.string().max(255).nullable().optional(),
			isPrimary: z.boolean().optional(),
			sortOrder: z.number().int().min(0).optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const SkuImageParamSchema = z.object({
	params: z.object({ id: numericIdString, skuId: numericIdString, imageId: numericIdString }),
});
