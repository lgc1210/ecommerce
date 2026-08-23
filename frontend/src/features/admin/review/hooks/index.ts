import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import adminReviewService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";
import type { ListReviewsAdminParams, ListReviewsAdminResult, ModerateReviewPayload, ReplyPayload } from "../types";

export const ADMIN_REVIEWS_QUERY_KEY = ["admin", "reviews"] as const;

export const useReviewsAdminQuery = (params: ListReviewsAdminParams) => {
	return useQuery<ListReviewsAdminResult>({
		queryKey: [...ADMIN_REVIEWS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await adminReviewService.getReviews(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Ẩn review vi phạm — KHÔNG sửa nội dung/rating gốc, chỉ chuyển isVisible=false và ghi log kiểm
 * duyệt (xem hideReview() ở backend review.service.ts).
 */
export const useHideReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ModerateReviewPayload) => adminReviewService.hideReview(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã ẩn đánh giá.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Ẩn đánh giá thất bại."));
		},
	});
};

export const useUnhideReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ModerateReviewPayload) => adminReviewService.unhideReview(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã hiện lại đánh giá.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Hiện lại đánh giá thất bại."));
		},
	});
};

export const useAdminDeleteReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => adminReviewService.deleteReview(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã xóa đánh giá.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa đánh giá thất bại."));
		},
	});
};

export const useCreateReviewReply = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ReplyPayload) => adminReviewService.createReply(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã phản hồi đánh giá.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Phản hồi thất bại."));
		},
	});
};

export const useUpdateReviewReply = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ReplyPayload) => adminReviewService.updateReply(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã cập nhật phản hồi.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật phản hồi thất bại."));
		},
	});
};

export const useDeleteReviewReply = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => adminReviewService.deleteReply(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã xóa phản hồi.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa phản hồi thất bại."));
		},
	});
};
