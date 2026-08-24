import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { reviewSort } from "./review.constant.js";
import { roundRating } from "./review.utils.js";
import { OrderStatus } from "../../generated/prisma/index.js";
import notificationService from "../notifications/notification.service.js";
import type { CreateReviewInput, UpdateReviewInput, ModerateReviewInput, CreateReviewReplyInput } from "./review.validation.js";

/** Số ngày kể từ khi đơn hàng "delivered" mà user còn được phép viết đánh giá. */
const REVIEW_ELIGIBLE_WINDOW_DAYS = 30;

/** User chỉ được chỉnh sửa đánh giá của mình đúng 1 lần (editCount tính từ 0). */
const MAX_REVIEW_EDIT_COUNT = 1;

function isWithinReviewWindow(deliveredAt: Date | null): boolean {
	if (!deliveredAt) return false;
	const deadline = new Date(deliveredAt.getTime() + REVIEW_ELIGIBLE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
	return new Date() <= deadline;
}

interface ListReviewsByProductParams {
	page?: string;
	limit?: string;
	rating?: string;
	sort?: string;
}

interface ListMyReviewsParams {
	page?: string;
	limit?: string;
}

interface ListReviewsAdminParams {
	page?: string;
	limit?: string;
	productId?: string;
	userId?: string;
	rating?: string;
	isVisible?: string;
	search?: string;
}

const reviewWithUserInclude = {
	user: { select: { id: true, name: true } },
	reply: { include: { repliedByUser: { select: { id: true, name: true } } } },
};

const reviewWithProductInclude = {
	product: { select: { id: true, name: true, slug: true } },
	reply: { include: { repliedByUser: { select: { id: true, name: true } } } },
};

const reviewWithProductAndUserInclude = {
	user: { select: { id: true, name: true } },
	product: { select: { id: true, name: true, slug: true } },
	reply: { include: { repliedByUser: { select: { id: true, name: true } } } },
	moderationLogs: { orderBy: { createdAt: "desc" as const }, take: 1, include: { actionByUser: { select: { id: true, name: true } } } },
};

class ReviewService {
	// ==========================================
	// Public
	// ==========================================
	async listReviewsByProduct(productId: number, params: ListReviewsByProductParams) {
		const product = await prisma.product.findUnique({ where: { id: productId } });
		if (!product) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		// Khách vãng lai/công khai chỉ thấy review đang hiển thị — review bị kiểm duyệt ẩn không lộ ra ngoài
		const where: Record<string, unknown> = { productId, isVisible: true };
		if (params.rating) where.rating = Number(params.rating);

		const orderBy = this.resolveSortOrder(params.sort);
		const { page, limit, skip } = parsePagination(params);

		const [reviews, total, ratingGroups, avgAgg] = await Promise.all([
			prisma.review.findMany({ where, include: reviewWithUserInclude, orderBy, skip, take: limit }),
			prisma.review.count({ where }),
			// Phân bố số lượng theo từng mức sao (1-5), tính trên TOÀN BỘ review ĐANG HIỂN THỊ của sản phẩm chứ không chỉ trang hiện tại
			prisma.review.groupBy({ by: ["rating"], where: { productId, isVisible: true }, _count: true }),
			prisma.review.aggregate({ where: { productId, isVisible: true }, _avg: { rating: true }, _count: true }),
		]);

		const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const group of ratingGroups) {
			const star = group.rating as 1 | 2 | 3 | 4 | 5;
			if (breakdown[star] !== undefined) breakdown[star] = group._count;
		}

		return {
			data: reviews,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
			summary: {
				average: roundRating(avgAgg._avg.rating),
				total: avgAgg._count,
				breakdown,
			},
		};
	}

	// ==========================================
	// Customer
	// ==========================================
	/** Danh sách order_item đủ điều kiện để user viết review: thuộc đơn đã "delivered", chưa từng được review. */
	async listReviewableOrderItems(userId: number) {
		return prisma.orderItem.findMany({
			where: {
				// Chỉ tính từ mốc deliveredAt (không phải orderStatus suông) để loại luôn những đơn đã
				// "delivered" nhưng đã quá hạn 30 ngày — khớp điều kiện chặn ở createReview() bên dưới,
				// tránh hiện nút "Viết đánh giá" cho sản phẩm mà bấm vào sẽ chỉ nhận lỗi hết hạn.
				order: { userId, orderStatus: OrderStatus.delivered, deliveredAt: { gte: new Date(Date.now() - REVIEW_ELIGIBLE_WINDOW_DAYS * 24 * 60 * 60 * 1000) } },
				review: null,
			},
			include: {
				productSku: {
					include: {
						product: { select: { id: true, name: true, slug: true } },
						images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }], take: 1 },
					},
				},
				order: { select: { id: true, orderNumber: true, createdAt: true, deliveredAt: true } },
			},
			orderBy: { id: "desc" },
		});
	}

	/** Danh sách review CHÍNH user hiện tại đã viết (mọi trạng thái isVisible) — dùng cho tab "Đánh giá của tôi", để sửa/xóa. */
	async listMyReviews(userId: number, params: ListMyReviewsParams) {
		const where = { userId };
		const { page, limit, skip } = parsePagination(params);

		const [reviews, total] = await Promise.all([
			prisma.review.findMany({ where, include: reviewWithProductInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
			prisma.review.count({ where }),
		]);

		return {
			data: reviews,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async createReview(userId: number, data: CreateReviewInput) {
		const orderItem = await prisma.orderItem.findUnique({
			where: { id: data.orderItemId },
			include: {
				order: { select: { userId: true, orderStatus: true, deliveredAt: true } },
				productSku: { select: { productId: true, product: { select: { name: true } } } },
			},
		});

		if (!orderItem || orderItem.order.userId !== userId) {
			throw new Error("NotFound: Sản phẩm mua hàng không tồn tại.");
		}
		if (orderItem.order.orderStatus !== OrderStatus.delivered) {
			throw new Error("BadRequest: Chỉ có thể đánh giá sau khi đơn hàng đã giao thành công.");
		}
		if (!isWithinReviewWindow(orderItem.order.deliveredAt)) {
			throw new Error(`BadRequest: Đã quá ${REVIEW_ELIGIBLE_WINDOW_DAYS} ngày kể từ khi nhận hàng, không thể đánh giá sản phẩm này nữa.`);
		}
		if (!orderItem.productSku?.productId) {
			throw new Error("BadRequest: Sản phẩm trong đơn hàng không còn tồn tại để đánh giá.");
		}

		const existing = await prisma.review.findUnique({ where: { orderItemId: data.orderItemId } });
		if (existing) {
			throw new Error("Conflict: Bạn đã đánh giá sản phẩm này rồi. Hãy chỉnh sửa đánh giá hiện có thay vì tạo mới.");
		}

		const review = await prisma.review.create({
			data: {
				userId,
				productId: orderItem.productSku.productId,
				orderItemId: data.orderItemId,
				rating: data.rating,
				comment: data.comment ?? null,
			},
			include: reviewWithUserInclude,
		});

		// "Khách hàng đánh giá" — bắn cho admin/manager ngay sau khi tạo đánh giá thành công.
		// Best-effort: không được phép làm hỏng luồng tạo đánh giá của khách nếu bắn thông báo lỗi.
		await notificationService.notifyAdminNewReview(review.id, orderItem.productSku.product?.name ?? "Sản phẩm", data.rating);

		return review;
	}

	async updateReview(userId: number, reviewId: number, data: UpdateReviewInput) {
		const review = await this.getReviewOrThrow(reviewId);

		if (review.userId !== userId) {
			throw new Error("Forbidden: Bạn không có quyền chỉnh sửa đánh giá này.");
		}
		if (review.editCount >= MAX_REVIEW_EDIT_COUNT) {
			throw new Error("Forbidden: Bạn chỉ được chỉnh sửa đánh giá 1 lần.");
		}

		const updateData: Record<string, unknown> = { editCount: { increment: 1 }, lastEditedAt: new Date() };
		if (data.rating !== undefined) updateData.rating = data.rating;
		if (data.comment !== undefined) updateData.comment = data.comment;

		return prisma.review.update({ where: { id: reviewId }, data: updateData, include: reviewWithUserInclude });
	}

	async deleteReview(userId: number, reviewId: number) {
		const review = await this.getReviewOrThrow(reviewId);

		if (review.userId !== userId) {
			throw new Error("Forbidden: Bạn không có quyền xóa đánh giá này.");
		}

		await this.deleteReviewCascade(reviewId);
	}

	// ==========================================
	// Admin / Moderation
	// ==========================================
	async listReviewsAdmin(params: ListReviewsAdminParams) {
		const where: Record<string, unknown> = {};

		if (params.productId) where.productId = Number(params.productId);
		if (params.userId) where.userId = Number(params.userId);
		if (params.rating) where.rating = Number(params.rating);
		if (params.isVisible !== undefined) where.isVisible = params.isVisible === "true";
		if (params.search) where.comment = { contains: params.search };

		const { page, limit, skip } = parsePagination(params);
		const [reviews, total] = await Promise.all([
			prisma.review.findMany({ where, include: reviewWithProductAndUserInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
			prisma.review.count({ where }),
		]);

		return {
			data: reviews,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	/**
	 * Kiểm duyệt viên ẩn review vi phạm (spam, ngôn từ không phù hợp...) — KHÔNG sửa nội dung/rating
	 * gốc của khách, chỉ chuyển isVisible=false và ghi lại lịch sử vào ReviewModerationLog để đối soát.
	 */
	async hideReview(actionByUserId: number, reviewId: number, data: ModerateReviewInput) {
		const review = await this.getReviewOrThrow(reviewId);
		if (!review.isVisible) {
			throw new Error("Conflict: Đánh giá này đã bị ẩn từ trước.");
		}

		return this.applyModeration(actionByUserId, reviewId, true, data.reason);
	}

	/** Kiểm duyệt viên hiện lại review đã bị ẩn trước đó (vd: xử lý oan, khiếu nại thành công). */
	async unhideReview(actionByUserId: number, reviewId: number, data: ModerateReviewInput) {
		const review = await this.getReviewOrThrow(reviewId);
		if (review.isVisible) {
			throw new Error("Conflict: Đánh giá này đang hiển thị, không cần thao tác.");
		}

		return this.applyModeration(actionByUserId, reviewId, false, data.reason);
	}

	/** Kiểm duyệt viên xóa hẳn review (vd: spam nghiêm trọng), không giới hạn theo chủ sở hữu. */
	async adminDeleteReview(reviewId: number) {
		await this.getReviewOrThrow(reviewId);
		await this.deleteReviewCascade(reviewId);
	}

	// ==========================================
	// Shop reply (1 review chỉ có tối đa 1 reply chính thức)
	// ==========================================
	async createReply(repliedBy: number, reviewId: number, data: CreateReviewReplyInput) {
		const review = await prisma.review.findUnique({
			where: { id: reviewId },
			include: { reply: true, product: { select: { slug: true } } },
		});
		if (!review) {
			throw new Error("NotFound: Đánh giá không tồn tại.");
		}
		if (review.reply) {
			throw new Error("Conflict: Đánh giá này đã có phản hồi. Hãy chỉnh sửa phản hồi hiện có thay vì tạo mới.");
		}

		const reply = await prisma.reviewReply.create({
			data: { reviewId, repliedBy, replyContent: data.replyContent },
			include: { repliedByUser: { select: { id: true, name: true } } },
		});

		// actionUrl điều hướng theo /product/:slug (route thật của FE) — KHÔNG dùng productId, xem
		// buildReviewRepliedNotification() ở notification.utils.ts.
		if (review.userId) {
			await notificationService.notifyReviewReplied(review.userId, review.product.slug, reviewId);
		}

		return reply;
	}

	async updateReply(reviewId: number, data: CreateReviewReplyInput) {
		const reply = await prisma.reviewReply.findUnique({ where: { reviewId } });
		if (!reply) {
			throw new Error("NotFound: Đánh giá này chưa có phản hồi để chỉnh sửa.");
		}

		return prisma.reviewReply.update({
			where: { reviewId },
			data: { replyContent: data.replyContent },
			include: { repliedByUser: { select: { id: true, name: true } } },
		});
	}

	async deleteReply(reviewId: number) {
		const reply = await prisma.reviewReply.findUnique({ where: { reviewId } });
		if (!reply) {
			throw new Error("NotFound: Đánh giá này chưa có phản hồi để xóa.");
		}
		await prisma.reviewReply.delete({ where: { reviewId } });
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async applyModeration(actionByUserId: number, reviewId: number, isHidden: boolean, reason?: string) {
		const [, review] = await prisma.$transaction([
			prisma.reviewModerationLog.create({ data: { reviewId, actionByUserId, isHidden, reason: reason ?? null } }),
			prisma.review.update({ where: { id: reviewId }, data: { isVisible: !isHidden }, include: reviewWithProductAndUserInclude }),
		]);
		return review;
	}

	/** Xóa review kèm các bản ghi phụ thuộc (reply, moderation logs) trong 1 transaction để không vướng FK constraint. */
	private async deleteReviewCascade(reviewId: number) {
		await prisma.$transaction([
			prisma.reviewModerationLog.deleteMany({ where: { reviewId } }),
			prisma.reviewReply.deleteMany({ where: { reviewId } }),
			prisma.review.delete({ where: { id: reviewId } }),
		]);
	}

	private resolveSortOrder(sort?: string) {
		switch (sort) {
			case reviewSort.oldest:
				return { createdAt: "asc" as const };
			case reviewSort.highest:
				return { rating: "desc" as const };
			case reviewSort.lowest:
				return { rating: "asc" as const };
			case reviewSort.newest:
			default:
				return { createdAt: "desc" as const };
		}
	}

	private async getReviewOrThrow(reviewId: number) {
		const review = await prisma.review.findUnique({ where: { id: reviewId } });
		if (!review) {
			throw new Error("NotFound: Đánh giá không tồn tại.");
		}
		return review;
	}
}

export default new ReviewService();
