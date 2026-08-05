import apiClient from "../../../../configs/apis";
import type { ListCategoriesParams, ListProductsParams } from "../types";

const productService = {
	// ---- Product (public) ----
	getProducts: (params: ListProductsParams = {}) =>
		apiClient.get("/products", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
				categoryId: params.categoryId,
				minPrice: params.minPrice,
				maxPrice: params.maxPrice,
				sort: params.sort,
			},
		}),
	getProductBySlug: (slug: string) => apiClient.get(`/products/slug/${slug}`),
	/** Sản phẩm nổi bật (is_featured=true), dùng cho carousel "Sản phẩm nổi bật" ở trang chủ. */
	getFeaturedProducts: (limit?: number) => apiClient.get("/products/featured", { params: { limit } }),

	// ---- Category (public) — chỉ dùng để hiển thị bộ lọc danh mục ở trang Shop ----
	getCategories: (params: ListCategoriesParams = {}) =>
		apiClient.get("/categories", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
			},
		}),
	/** Cây danh mục đầy đủ (tree=true) — dùng để render bộ lọc phân cấp ở trang Shop (xem
	 *  category.service.ts:listCategories ở backend, bỏ qua phân trang khi tree=true). */
	getCategoryTree: () => apiClient.get("/categories", { params: { tree: "true" } }),
	/** Danh mục nổi bật (is_featured=true), dùng cho mục "Danh mục nổi bật" ở trang chủ. */
	getFeaturedCategories: (limit?: number) => apiClient.get("/categories/featured", { params: { limit } }),
};

export default productService;
