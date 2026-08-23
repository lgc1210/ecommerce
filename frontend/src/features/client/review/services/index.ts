import apiClient from "../../../../configs/apis";
import type { CreateReviewPayload, ListMyReviewsParams, ListMyReviewsResult, ListReviewsByProductParams, ListReviewsByProductResult, ReviewableOrderItem, UpdateReviewPayload } from "../types";

const reviewService = {
	/** Danh sách review công khai của 1 sản phẩm (chỉ review isVisible=true) + tổng hợp điểm/breakdown. */
	getReviewsByProduct: (productId: number, params: ListReviewsByProductParams = {}) =>
		apiClient.get<ListReviewsByProductResult>(`/reviews/product/${productId}`, {
			params: { page: params.page, limit: params.limit, rating: params.rating, sort: params.sort },
		}),
	/** Danh sách sản phẩm user đã mua (đơn đã "delivered") nhưng chưa review — để hiện nút "Viết đánh giá". */
	getReviewableOrderItems: () => apiClient.get<{ data: ReviewableOrderItem[] }>("/reviews/reviewable-items"),
	/** Danh sách review CHÍNH user hiện tại đã viết (mọi trạng thái) — để sửa/xóa ở tab "Đánh giá của tôi". */
	getMyReviews: (params: ListMyReviewsParams = {}) => apiClient.get<ListMyReviewsResult>("/reviews/me", { params }),
	createReview: (payload: CreateReviewPayload) => apiClient.post("/reviews", payload),
	updateReview: ({ id, ...payload }: UpdateReviewPayload) => apiClient.patch(`/reviews/${id}`, payload),
	deleteReview: (id: number) => apiClient.delete(`/reviews/${id}`),
};

export default reviewService;
