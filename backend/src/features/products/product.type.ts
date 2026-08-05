export interface SkuInput {
	sku?: string;
	price: number;
	stockQuantity?: number;
	variationDetails: Record<string, unknown>;
	/** Khối lượng (gram) của CHÍNH biến thể này. Bỏ trống -> dùng giá trị mặc định (xem product.utils.ts). */
	weightGram?: number;
	/** Kích thước đóng gói (cm) của CHÍNH biến thể này. Bỏ trống -> dùng giá trị mặc định. */
	lengthCm?: number;
	widthCm?: number;
	heightCm?: number;
}

export interface CreateProductInput {
	name: string;
	slug?: string;
	description?: string;
	categoryId?: number | null;
	isActive?: boolean;
	isFeatured?: boolean;
	thumbnailUrl?: string;
	skus?: SkuInput[];
}

export interface UpdateProductInput {
	name?: string;
	slug?: string;
	description?: string;
	categoryId?: number | null;
	isActive?: boolean;
	isFeatured?: boolean;
	thumbnailUrl?: string | null;
}

export interface UpdateSkuInput {
	sku?: string;
	price?: number;
	stockQuantity?: number;
	variationDetails?: Record<string, unknown>;
	weightGram?: number;
	lengthCm?: number;
	widthCm?: number;
	heightCm?: number;
}

export interface ListProductsParams {
	page?: string;
	limit?: string;
	search?: string;
	categoryId?: string;
	minPrice?: string;
	maxPrice?: string;
	sort?: string;
	isActive?: string;
}
