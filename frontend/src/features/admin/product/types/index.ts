import type { Pagination } from "../../../../types";

export interface ProductCategoryRef {
	id: number;
	name: string;
	slug: string;
}

/** Thuộc tính biến thể tự do, vd: { color: "Đỏ", size: "M" } — khớp Json field ở backend (Prisma Json, không có shape cố định). */
export type VariationDetails = Record<string, string>;

export interface ProductImage {
	id: number;
	productSkuId: number;
	imageUrl: string;
	altText: string | null;
	isPrimary: boolean;
	sortOrder: number;
	createdAt?: string;
}

/**
 * 1 biến thể (SKU) của sản phẩm. Lưu ý: "price" là Prisma Decimal ở backend ->
 * serialize qua JSON thành string, phải Number(...) trước khi tính toán/hiển thị.
 */
export interface ProductSku {
	id: number;
	productId: number | null;
	sku: string;
	price: string;
	stockQuantity: number;
	variationDetails: VariationDetails;
	/** Khối lượng riêng của biến thể (gram) — dùng để tính phí vận chuyển GHN theo từng đơn hàng. */
	weightGram: number;
	/** Kích thước đóng gói riêng của biến thể (cm). */
	lengthCm: number;
	widthCm: number;
	heightCm: number;
	images: ProductImage[];
	createdAt?: string;
	updatedAt?: string;
}

/** SKU rút gọn dùng cho trang danh sách (không kèm images, khớp productListInclude ở backend). */
export interface ProductSkuSummary {
	id: number;
	sku: string;
	price: string;
	stockQuantity: number;
	variationDetails: VariationDetails;
}

/** 1 sản phẩm nhìn từ trang danh sách admin (GET /products/admin). */
export interface AdminProductListItem {
	id: number;
	categoryId: number | null;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	isFeatured: boolean;
	thumbnailUrl: string | null;
	createdAt: string;
	updatedAt: string;
	category: ProductCategoryRef | null;
	skus: ProductSkuSummary[];
	_count: { reviews: number };
}

export interface AdminProductReview {
	id: number;
	rating: number;
	comment: string | null;
	createdAt: string;
	user: { id: number; name: string } | null;
}

/** 1 sản phẩm đầy đủ (GET /products/id/:id) — kèm SKU (có ảnh) + review gần nhất. */
export interface AdminProductDetail {
	id: number;
	categoryId: number | null;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	isFeatured: boolean;
	thumbnailUrl: string | null;
	createdAt: string;
	updatedAt: string;
	category: ProductCategoryRef | null;
	skus: ProductSku[];
	reviews: AdminProductReview[];
	averageRating: number | null;
}

/** Kết quả trả về từ POST /uploads/product-image (chọn ảnh từ máy). */
export interface UploadImageResult {
	url: string;
	filename: string;
}

export interface ListProductsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: number;
	minPrice?: number;
	maxPrice?: number;
	sort?: "newest" | "name_asc" | "name_desc";
	isActive?: boolean;
}

export interface ListProductsResult {
	data: AdminProductListItem[];
	pagination: Pagination;
}

// ==========================================
// Payload ghi dữ liệu (khớp CreateProductSchema/UpdateProductSchema ở backend)
// ==========================================
export interface CreateProductPayload {
	name: string;
	slug?: string;
	description?: string;
	categoryId?: number | null;
	isActive?: boolean;
	/** Đánh dấu hiển thị ở carousel "Sản phẩm nổi bật" trên trang chủ. */
	isFeatured?: boolean;
	/** URL trả về từ POST /uploads/product-image sau khi chọn ảnh từ máy. */
	thumbnailUrl?: string | null;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
	id: number;
}

export interface SkuPayload {
	sku?: string;
	price: number;
	stockQuantity?: number;
	variationDetails: VariationDetails;
	weightGram?: number;
	lengthCm?: number;
	widthCm?: number;
	heightCm?: number;
}

export interface CreateSkuPayload extends SkuPayload {
	productId: number;
}

export interface UpdateSkuPayload extends Partial<SkuPayload> {
	productId: number;
	skuId: number;
}

export interface DeleteSkuPayload {
	productId: number;
	skuId: number;
}

export interface UpdateSkuStockPayload {
	productId: number;
	skuId: number;
	stockQuantity: number;
}

export interface SkuImagePayload {
	imageUrl: string;
	altText?: string;
	isPrimary?: boolean;
	sortOrder?: number;
}

export interface AddSkuImagePayload extends SkuImagePayload {
	productId: number;
	skuId: number;
}

export interface UpdateSkuImagePayload extends Partial<SkuImagePayload> {
	productId: number;
	skuId: number;
	imageId: number;
}

export interface DeleteSkuImagePayload {
	productId: number;
	skuId: number;
	imageId: number;
}
