export interface SkuInput {
	sku?: string;
	price: number;
	stockQuantity?: number;
	variationDetails: Record<string, unknown>;
}

export interface CreateProductInput {
	name: string;
	slug?: string;
	description?: string;
	categoryId?: number | null;
	isActive?: boolean;
	thumbnailUrl?: string;
	skus?: SkuInput[];
}

export interface UpdateProductInput {
	name?: string;
	slug?: string;
	description?: string;
	categoryId?: number | null;
	isActive?: boolean;
	thumbnailUrl?: string | null;
}

export interface UpdateSkuInput {
	sku?: string;
	price?: number;
	stockQuantity?: number;
	variationDetails?: Record<string, unknown>;
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
