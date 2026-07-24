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

	// ---- Category (public) — chỉ dùng để hiển thị bộ lọc danh mục ở trang Shop ----
	getCategories: (params: ListCategoriesParams = {}) =>
		apiClient.get("/categories", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
			},
		}),
};

export default productService;
