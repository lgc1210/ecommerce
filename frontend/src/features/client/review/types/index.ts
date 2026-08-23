import type { Pagination } from "../../../../types";

export interface ReviewUser {
	id: number;
	name: string;
}

export interface ReviewReply {
	id: number;
	reviewId: number;
	replyContent: string;
	createdAt: string | null;
	updatedAt: string | null;
	repliedByUser: ReviewUser;
}

/**
 * 1 review công khai (GET /reviews/product/:productId) — không có field isVisible/moderationLogs
 * vì endpoint public chỉ trả review đã isVisible=true, không cần lộ chi tiết kiểm duyệt ra ngoài.
 */
export interface PublicReview {
	id: number;
	userId: number | null;
	productId: number;
	orderItemId: number | null;
	rating: number;
	comment: string | null;
	editCount: number;
	lastEditedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	user: ReviewUser | null;
	reply: ReviewReply | null;
}

export interface ReviewRatingBreakdown {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
}

export interface ReviewSummary {
	average: number | null;
	total: number;
	breakdown: ReviewRatingBreakdown;
}

export interface ListReviewsByProductParams {
	page?: number;
	limit?: number;
	rating?: number;
	sort?: "newest" | "oldest" | "highest" | "lowest";
}

export interface ListReviewsByProductResult {
	data: PublicReview[];
	pagination: Pagination;
	summary: ReviewSummary;
}

/**
 * 1 sản phẩm đã mua đủ điều kiện viết review (GET /reviews/reviewable-items) — thuộc order_item
 * của 1 đơn đã "delivered", CÒN TRONG hạn 30 ngày kể từ deliveredAt, và chưa từng được review
 * (xem listReviewableOrderItems ở backend, REVIEW_ELIGIBLE_WINDOW_DAYS).
 */
export interface ReviewableOrderItem {
	id: number;
	quantity: number;
	priceAtPurchase: string;
	order: { id: number; orderNumber: string; createdAt: string | null; deliveredAt: string | null };
	productSku: {
		id: number;
		sku: string;
		product: { id: number; name: string; slug: string } | null;
		images: { id: number; imageUrl: string; altText: string | null }[];
	} | null;
}

export interface CreateReviewPayload {
	orderItemId: number;
	rating: number;
	comment?: string;
}

export interface UpdateReviewPayload {
	id: number;
	rating?: number;
	comment?: string | null;
}

export interface ListMyReviewsParams {
	page?: number;
	limit?: number;
}

/** 1 review CHÍNH user hiện tại đã viết (GET /reviews/me) — dùng cho tab "Đánh giá của tôi" để sửa/xóa. */
export interface MyReview {
	id: number;
	userId: number | null;
	productId: number;
	orderItemId: number | null;
	rating: number;
	comment: string | null;
	isVisible: boolean;
	editCount: number;
	lastEditedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	product: { id: number; name: string; slug: string };
	reply: ReviewReply | null;
}

export interface ListMyReviewsResult {
	data: MyReview[];
	pagination: Pagination;
}
