import type { Pagination } from "../../../../types";
import type { productSort } from "../constants";

export type productSort = (typeof productSort)[keyof typeof productSort];

export interface PublicCategoryRef {
	id: number;
	name: string;
	slug: string;
}

/** Danh mục dùng cho bộ lọc ở trang Shop — khớp GET /categories (không cần tree). */
export interface PublicCategory extends PublicCategoryRef {
	description: string | null;
	_count: { products: number };
}

/**
 * Node cây danh mục — khớp GET /categories?tree=true (xem buildCategoryTree ở backend).
 * Dùng để render bộ lọc danh mục phân cấp (cha - con) ở trang Shop, thay cho danh sách phẳng.
 */
export interface PublicCategoryTreeNode extends PublicCategoryRef {
	description: string | null;
	_count: { subcategories: number; products: number };
	subcategories: PublicCategoryTreeNode[];
}

/** Thuộc tính biến thể tự do, vd: { color: "Đen", size: "M" } — khớp Json field ở backend. */
export type VariationDetails = Record<string, string>;

export interface PublicProductImage {
	id: number;
	imageUrl: string;
	altText: string | null;
	isPrimary: boolean;
	sortOrder: number;
}

/** SKU rút gọn dùng cho trang danh sách (GET /products) — khớp productListInclude ở backend, không kèm ảnh. */
export interface PublicProductSkuSummary {
	id: number;
	sku: string;
	/** Prisma Decimal -> serialize qua JSON thành string, phải Number(...) trước khi tính toán/hiển thị. */
	price: string;
	stockQuantity: number;
	variationDetails: VariationDetails;
}

/** 1 biến thể (SKU) đầy đủ, kèm ảnh — dùng cho trang chi tiết (GET /products/slug/:slug). */
export interface PublicProductSku {
	id: number;
	sku: string;
	price: string;
	stockQuantity: number;
	variationDetails: VariationDetails;
	images: PublicProductImage[];
}

/** 1 sản phẩm nhìn từ trang danh sách công khai (GET /products). */
export interface PublicProductListItem {
	id: number;
	categoryId: number | null;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	thumbnailUrl: string | null;
	createdAt: string;
	updatedAt: string;
	category: PublicCategoryRef | null;
	skus: PublicProductSkuSummary[];
	_count: { reviews: number };
}

export interface PublicProductReview {
	id: number;
	rating: number;
	comment: string | null;
	createdAt: string | null;
	user: { id: number; name: string } | null;
}

/**
 * 1 sản phẩm đầy đủ (GET /products/slug/:slug) — kèm SKU (có ảnh) + review gần nhất (tối đa 20, xem
 * productDetailInclude ở backend, nên `reviews.length` là số review gần nhất, không phải tổng số thực tế).
 */
export interface PublicProductDetail {
	id: number;
	categoryId: number | null;
	name: string;
	slug: string;
	description: string | null;
	isActive: boolean;
	thumbnailUrl: string | null;
	createdAt: string;
	updatedAt: string;
	category: PublicCategoryRef | null;
	skus: PublicProductSku[];
	reviews: PublicProductReview[];
	averageRating: number | null;
	/** Sản phẩm liên quan (ưu tiên cùng danh mục, fallback mới nhất) — đã được backend tính sẵn. */
	related: PublicProductListItem[];
}

export interface ListProductsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: number;
	minPrice?: number;
	maxPrice?: number;
	/** Chỉ các giá trị này được backend hỗ trợ (xem ListProductsQuerySchema). "popular" sắp xếp theo số
	 *  lượng đánh giá giảm dần — dùng cho mục "Được yêu thích nhất" ở trang chủ. "price_asc"/"price_desc"
	 *  sắp xếp theo giá thấp nhất của sản phẩm (min giữa các SKU). */
	sort?: productSort;
}

export interface ListProductsResult {
	data: PublicProductListItem[];
	pagination: Pagination;
}

export interface ListCategoriesParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface ListCategoriesResult {
	data: PublicCategory[];
	pagination: Pagination;
}

/** Khớp GET /categories/featured — không phân trang (xem CategoryService.getFeaturedCategories ở backend). */
export interface FeaturedCategoriesResult {
	data: PublicCategory[];
}

/**
 * Shape tối thiểu mà <ProductCard> cần để hiển thị. `MockProduct` (dữ liệu mẫu ở trang Home) thoả mãn
 * interface này (superset), nên ProductCard dùng chung được cho cả dữ liệu mẫu lẫn dữ liệu thật từ API.
 * `rating` để optional vì GET /products (danh sách) không trả điểm đánh giá trung bình — chỉ có ở trang
 * chi tiết (averageRating); khi không có rating, ProductCard bỏ qua hàng sao thay vì hiển thị sai lệch.
 */
export interface ProductCardItem {
	slug: string;
	name: string;
	price: number;
	oldPrice?: number;
	rating?: number;
	reviewCount: number;
	inStock: boolean;
	/** false = sản phẩm đã ngừng kinh doanh (isActive=false ở backend) — card hiển thị badge riêng và không cho bấm vào.
	 *  Optional để tương thích với `MockProduct` (trang Home) vốn không có field này — khi thiếu, ProductCard coi như active. */
	isActive?: boolean;
	image: string;
}
