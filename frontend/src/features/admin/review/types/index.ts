import type { Pagination } from "../../../../types";

export interface ReviewUser {
	id: number;
	name: string;
}

export interface AdminReviewReply {
	id: number;
	reviewId: number;
	replyContent: string;
	createdAt: string | null;
	updatedAt: string | null;
	repliedByUser: ReviewUser;
}

export interface ReviewModerationLog {
	id: number;
	reviewId: number;
	actionByUserId: number;
	isHidden: boolean;
	reason: string | null;
	createdAt: string | null;
	actionByUser: ReviewUser;
}

/** 1 review nhìn từ phía admin (GET /reviews/admin) — kèm thông tin kiểm duyệt gần nhất nếu có. */
export interface AdminReview {
	id: number;
	userId: number | null;
	productId: number;
	orderItemId: number | null;
	rating: number;
	comment: string | null;
	isVisible: boolean;
	isRefundedTag: boolean;
	editCount: number;
	lastEditedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	user: ReviewUser | null;
	product: { id: number; name: string; slug: string };
	reply: AdminReviewReply | null;
	/** Chỉ lấy 1 log kiểm duyệt gần nhất (xem reviewWithProductAndUserInclude ở backend), không phải toàn bộ lịch sử. */
	moderationLogs: ReviewModerationLog[];
}

export interface ListReviewsAdminParams {
	page?: number;
	limit?: number;
	productId?: number;
	userId?: number;
	rating?: number;
	isVisible?: boolean;
	search?: string;
}

export interface ListReviewsAdminResult {
	data: AdminReview[];
	pagination: Pagination;
}

export interface ModerateReviewPayload {
	id: number;
	reason?: string;
}

export interface ReplyPayload {
	id: number;
	replyContent: string;
}
