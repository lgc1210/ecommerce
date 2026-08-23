import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import reviewService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";
import { PUBLIC_PRODUCTS_QUERY_KEY } from "../../product/hooks";
import type { CreateReviewPayload, ListMyReviewsParams, ListMyReviewsResult, ListReviewsByProductParams, ListReviewsByProductResult, ReviewableOrderItem, UpdateReviewPayload } from "../types";

export const PUBLIC_REVIEWS_QUERY_KEY = ["client", "reviews"] as const;
export const MY_REVIEWS_QUERY_KEY = ["client", "reviews", "me"] as const;
export const REVIEWABLE_ITEMS_QUERY_KEY = ["client", "reviews", "reviewable-items"] as const;

/** Danh sách review công khai của 1 sản phẩm — dùng cho tab "Đánh giá" ở trang chi tiết sản phẩm. */
export const useReviewsByProductQuery = (productId: number | undefined, params: ListReviewsByProductParams) => {
	return useQuery<ListReviewsByProductResult>({
		queryKey: [...PUBLIC_REVIEWS_QUERY_KEY, "product", productId, params],
		queryFn: async () => {
			const res = await reviewService.getReviewsByProduct(productId as number, params);
			return res.data;
		},
		enabled: Boolean(productId),
		placeholderData: keepPreviousData,
	});
};

/** Sản phẩm đã mua (đơn "delivered") nhưng chưa review — dùng để hiện nút "Viết đánh giá" ở tài khoản. */
export const useReviewableOrderItemsQuery = () => {
	return useQuery<ReviewableOrderItem[]>({
		queryKey: REVIEWABLE_ITEMS_QUERY_KEY,
		queryFn: async () => {
			const res = await reviewService.getReviewableOrderItems();
			return res.data.data;
		},
	});
};

/** Review CHÍNH user hiện tại đã viết — dùng cho tab "Đánh giá của tôi" (sửa/xóa). */
export const useMyReviewsQuery = (params: ListMyReviewsParams) => {
	return useQuery<ListMyReviewsResult>({
		queryKey: [...MY_REVIEWS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await reviewService.getMyReviews(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Sau khi tạo/sửa/xóa review CỦA CHÍNH USER, phải invalidate cả 3 nơi: danh sách review công khai
 * của sản phẩm đó (nếu đang mở trang chi tiết), tab "reviewable-items" (sản phẩm vừa review xong
 * biến mất khỏi danh sách "chưa review"), và tab "Đánh giá của tôi". Đồng thời invalidate luôn
 * PUBLIC_PRODUCTS_QUERY_KEY vì trang chi tiết sản phẩm có hiển thị `averageRating`/reviewCount
 * lấy từ chính GET /products/slug/:slug (xem ProductDetailPage) — nếu không invalidate, số liệu đó
 * sẽ lệch với review vừa tạo/sửa/xóa cho tới khi cache tự hết hạn.
 */
const invalidateReviewRelatedQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
	queryClient.invalidateQueries({ queryKey: PUBLIC_REVIEWS_QUERY_KEY });
	queryClient.invalidateQueries({ queryKey: REVIEWABLE_ITEMS_QUERY_KEY });
	queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY });
	queryClient.invalidateQueries({ queryKey: PUBLIC_PRODUCTS_QUERY_KEY });
};

export const useCreateReviewMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateReviewPayload) => reviewService.createReview(payload),
		onSuccess: (res) => {
			invalidateReviewRelatedQueries(queryClient);
			toast.success(res.data.message ?? "Đánh giá sản phẩm thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gửi đánh giá thất bại, vui lòng thử lại."));
		},
	});
};

export const useUpdateReviewMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateReviewPayload) => reviewService.updateReview(payload),
		onSuccess: (res) => {
			invalidateReviewRelatedQueries(queryClient);
			toast.success(res.data.message ?? "Cập nhật đánh giá thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật đánh giá thất bại."));
		},
	});
};

export const useDeleteReviewMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => reviewService.deleteReview(id),
		onSuccess: (res) => {
			invalidateReviewRelatedQueries(queryClient);
			toast.success(res.data.message ?? "Đã xóa đánh giá.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa đánh giá thất bại."));
		},
	});
};
