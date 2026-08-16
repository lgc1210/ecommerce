import { z } from "zod";
import { numericIdString, slugRegex } from "../../shared/validation.js";
import { listProductSort, productSort } from "./product.constant.js";

// ==========================================
// SKU (biến thể) - dùng chung cho tạo/sửa
// ==========================================
const SkuInputSchema = z.object({
	sku: z.string().min(1, { message: "Mã SKU không được để trống." }).max(50).optional(), // Bỏ trống -> hệ thống tự sinh mã SKU từ tên sản phẩm + biến thể
	price: z.number().positive({ message: "Giá phải lớn hơn 0." }),
	oldPrice: z.number().positive({ message: "Giá khóa phải lớn hơn 0." }).nullable().optional(),
	stockQuantity: z.number().int().min(0, { message: "Tồn kho không được âm." }).optional(),
	variationDetails: z.record(z.string(), z.any()).refine((obj) => Object.keys(obj).length > 0, {
		message: "Cần ít nhất 1 thuộc tính biến thể (vd: color, size).",
	}),
	// Khối lượng/kích thước riêng của biến thể — dùng để tính phí vận chuyển GHN thật cho từng đơn
	// hàng (xem external/ghn/ghn.service.ts). Bỏ trống -> backend tự áp giá trị mặc định.
	weightGram: z.number().int().positive({ message: "Khối lượng phải lớn hơn 0 (gram)." }).optional(),
	lengthCm: z.number().int().positive({ message: "Chiều dài phải lớn hơn 0 (cm)." }).optional(),
	widthCm: z.number().int().positive({ message: "Chiều rộng phải lớn hơn 0 (cm)." }).optional(),
	heightCm: z.number().int().positive({ message: "Chiều cao phải lớn hơn 0 (cm)." }).optional(),
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
		// "popular" = sắp xếp theo số lượng đánh giá (reviews) giảm dần, dùng cho mục "Được yêu thích
		// nhất" ở trang chủ — xem ProductService.resolveSortOrder. "price_asc"/"price_desc" sắp xếp
		// theo giá thấp nhất của sản phẩm (min giữa các SKU) — khớp với giá "từ" hiển thị ở ProductCard.
		sort: z.enum(listProductSort).optional(),
		// Áp dụng như nhau cho cả route public lẫn admin: lọc theo isActive nếu có truyền, mặc định
		// (không truyền) trả về TẤT CẢ sản phẩm (active lẫn inactive) — xem thêm ProductService.listProducts.
		isActive: z.enum(["true", "false"]).optional(),
	}),
});

export const ProductSlugParamSchema = z.object({
	params: z.object({
		slug: z.string().min(1, { message: "Slug không hợp lệ." }).max(100),
	}),
});

export const FeaturedProductsQuerySchema = z.object({
	query: z.object({
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});

// ==========================================
// Admin - Product
// ==========================================
export const CreateProductSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Tên sản phẩm phải có ít nhất 2 ký tự." }).max(100),
		slug: z.string().min(2).max(100).regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." }).optional(),
		description: z.string().max(5000).optional(),
		categoryId: z.number().int().positive().nullable().optional(),
		isActive: z.boolean().optional(),
		// Đánh dấu hiển thị ở carousel "Sản phẩm nổi bật" trên trang chủ
		isFeatured: z.boolean().optional(),
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
			slug: z.string().min(2).max(100).regex(slugRegex, { message: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang." }).optional(),
			description: z.string().max(5000).optional(),
			categoryId: z.number().int().positive().nullable().optional(),
			isActive: z.boolean().optional(),
			isFeatured: z.boolean().optional(),
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
			oldPrice: SkuInputSchema.shape.oldPrice.optional(),
			stockQuantity: SkuInputSchema.shape.stockQuantity,
			variationDetails: SkuInputSchema.shape.variationDetails.optional(),
			weightGram: SkuInputSchema.shape.weightGram,
			lengthCm: SkuInputSchema.shape.lengthCm,
			widthCm: SkuInputSchema.shape.widthCm,
			heightCm: SkuInputSchema.shape.heightCm,
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
		imageUrl: z.string().min(1, { message: "imageUrl không được để trống." }).max(500).url({ message: "imageUrl phải là một URL hợp lệ." }),
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
