import { keepPreviousData, useQuery } from "@tanstack/react-query";
import productService from "../services";
import type {
	FeaturedCategoriesResult,
	FeaturedProductsResult,
	ListCategoriesParams,
	ListCategoriesResult,
	ListProductsParams,
	ListProductsResult,
	PublicCategoryTreeNode,
	PublicProductDetail,
} from "../types";

export const PUBLIC_PRODUCTS_QUERY_KEY = ["client", "products"] as const;
export const PUBLIC_CATEGORIES_QUERY_KEY = ["client", "categories"] as const;

export const useProductsQuery = (params: ListProductsParams, options: { enabled?: boolean } = {}) => {
	return useQuery<ListProductsResult>({
		queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, "list", params],
		queryFn: async () => {
			const res = await productService.getProducts(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
		enabled: options.enabled ?? true,
	});
};

export const useProductBySlugQuery = (slug: string | undefined) => {
	return useQuery<PublicProductDetail>({
		queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, "detail", slug],
		queryFn: async () => {
			const res = await productService.getProductBySlug(slug as string);
			return res.data.data;
		},
		enabled: Boolean(slug),
		retry: false, // Slug không tồn tại/ngừng kinh doanh -> 404, không cần thử lại
	});
};

/** Sản phẩm nổi bật dùng cho carousel "Sản phẩm nổi bật" ở trang chủ (xem ProductService.getFeaturedProducts). */
export const useFeaturedProductsQuery = (limit?: number) => {
	return useQuery<FeaturedProductsResult>({
		queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, "featured", limit],
		queryFn: async () => {
			const res = await productService.getFeaturedProducts(limit);
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
	});
};

/** Danh sách danh mục dùng cho bộ lọc ở trang Shop. limit cao để lấy đủ danh mục trong 1 lần gọi. */
export const useCategoriesQuery = (params: ListCategoriesParams = { limit: 100 }, options: { enabled?: boolean } = {}) => {
	return useQuery<ListCategoriesResult>({
		queryKey: [...PUBLIC_CATEGORIES_QUERY_KEY, "list", params],
		queryFn: async () => {
			const res = await productService.getCategories(params);
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
		enabled: options.enabled ?? true,
	});
};

/**
 * Cây danh mục phân cấp (tree=true) dùng cho bộ lọc ở trang Shop — thay cho danh sách phẳng
 * (useCategoriesQuery) để hiển thị danh mục cha kèm dropdown danh mục con lồng bên trong.
 */
export const useCategoryTreeQuery = () => {
	return useQuery<PublicCategoryTreeNode[]>({
		queryKey: [...PUBLIC_CATEGORIES_QUERY_KEY, "tree"],
		queryFn: async () => {
			const res = await productService.getCategoryTree();
			return res.data.data;
		},
		staleTime: 5 * 60 * 1000,
	});
};

/** Danh mục nổi bật dùng cho mục "Danh mục nổi bật" ở trang chủ (xem CategoryService.getFeaturedCategories). */
export const useFeaturedCategoriesQuery = (limit?: number) => {
	return useQuery<FeaturedCategoriesResult>({
		queryKey: [...PUBLIC_CATEGORIES_QUERY_KEY, "featured", limit],
		queryFn: async () => {
			const res = await productService.getFeaturedCategories(limit);
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
	});
};
