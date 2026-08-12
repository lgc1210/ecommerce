import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import productService from "../services";
import type { FeaturedProductsResult, ListProductsParams, ListProductsResult, PublicProductDetail } from "../types";
import { useRef } from "react";

export const PUBLIC_PRODUCTS_QUERY_KEY = ["client", "products"] as const;

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
/** Hook hỗ trợ prefetch dữ liệu chi tiết sản phẩm khi hover */
export const usePrefetchProductDetail = () => {
	const queryClient = useQueryClient();
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const prefetch = async (slug: string | undefined) => {
		if (!slug) return;

		clearTimeout(timer.current);
		timer.current = setTimeout(async () => {
			await queryClient.prefetchQuery({
				// Đảm bảo trùng khớp 100% với queryKey của useProductBySlugQuery
				queryKey: [...PUBLIC_PRODUCTS_QUERY_KEY, "detail", slug],
				// Đảm bảo trùng khớp 100% với cách xử lý dữ liệu của useProductBySlugQuery
				queryFn: async () => {
					const res = await productService.getProductBySlug(slug);
					return res.data.data;
				},
				// Cấu hình thời gian dữ liệu được coi là mới để không refetch liên tục khi hover ra/vào nhiều lần
				staleTime: 5 * 60 * 1000,
			});
		}, 100);
	};

	return prefetch;
};
