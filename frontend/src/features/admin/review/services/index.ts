import apiClient from "../../../../configs/apis";
import type { ListReviewsAdminParams, ListReviewsAdminResult, ModerateReviewPayload, ReplyPayload } from "../types";

const adminReviewService = {
	getReviews: (params: ListReviewsAdminParams = {}) =>
		apiClient.get<ListReviewsAdminResult>("/reviews/admin", {
			params: {
				page: params.page,
				limit: params.limit,
				productId: params.productId,
				userId: params.userId,
				rating: params.rating,
				isVisible: params.isVisible === undefined ? undefined : String(params.isVisible),
				search: params.search || undefined,
			},
		}),
	hideReview: ({ id, reason }: ModerateReviewPayload) => apiClient.patch(`/reviews/admin/${id}/hide`, { reason }),
	unhideReview: ({ id, reason }: ModerateReviewPayload) => apiClient.patch(`/reviews/admin/${id}/unhide`, { reason }),
	deleteReview: (id: number) => apiClient.delete(`/reviews/admin/${id}`),
	createReply: ({ id, replyContent }: ReplyPayload) => apiClient.post(`/reviews/admin/${id}/reply`, { replyContent }),
	updateReply: ({ id, replyContent }: ReplyPayload) => apiClient.patch(`/reviews/admin/${id}/reply`, { replyContent }),
	deleteReply: (id: number) => apiClient.delete(`/reviews/admin/${id}/reply`),
};

export default adminReviewService;
