import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { reviewSort } from "./review.constant.js";
import { roundRating } from "./review.utils.js";
import type { CreateReviewInput, UpdateReviewInput } from "./review.validation.js";

interface ListReviewsByProductParams {
	page?: string;
	limit?: string;
	rating?: string;
	sort?: string;
}

interface ListReviewsAdminParams {
	page?: string;
	limit?: string;
	productId?: string;
	userId?: string;
	rating?: string;
	search?: string;
}

const reviewWithUserInclude = {
	user: { select: { id: true, name: true } },
};

const reviewWithProductAndUserInclude = {
	user: { select: { id: true, name: true } },
	product: { select: { id: true, name: true, slug: true } },
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

		const where: Record<string, unknown> = { productId };
		if (params.rating) where.rating = Number(params.rating);

		const orderBy = this.resolveSortOrder(params.sort);
		const { page, limit, skip } = parsePagination(params);

		const [reviews, total, ratingGroups, avgAgg] = await Promise.all([
			prisma.review.findMany({ where, include: reviewWithUserInclude, orderBy, skip, take: limit }),
			prisma.review.count({ where }),
			// Phân bố số lượng theo từng mức sao (1-5), tính trên TOÀN BỘ review của sản phẩm chứ không chỉ trang hiện tại
			prisma.review.groupBy({ by: ["rating"], where: { productId }, _count: true }),
			prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true }),
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
	async createReview(userId: number, data: CreateReviewInput) {
		const product = await prisma.product.findUnique({ where: { id: data.productId } });
		if (!product) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		const existing = await prisma.review.findUnique({
			where: { userId_productId: { userId, productId: data.productId } },
		});
		if (existing) {
			throw new Error("Conflict: Bạn đã đánh giá sản phẩm này rồi. Hãy chỉnh sửa đánh giá hiện có thay vì tạo mới.");
		}

		return prisma.review.create({
			data: {
				userId,
				productId: data.productId,
				rating: data.rating,
				comment: data.comment ?? null,
			},
			include: reviewWithUserInclude,
		});
	}

	async updateReview(userId: number, reviewId: number, data: UpdateReviewInput) {
		const review = await this.getReviewOrThrow(reviewId);

		if (review.userId !== userId) {
			throw new Error("Forbidden: Bạn không có quyền chỉnh sửa đánh giá này.");
		}

		const updateData: Record<string, unknown> = {};
		if (data.rating !== undefined) updateData.rating = data.rating;
		if (data.comment !== undefined) updateData.comment = data.comment;

		return prisma.review.update({ where: { id: reviewId }, data: updateData, include: reviewWithUserInclude });
	}

	async deleteReview(userId: number, reviewId: number) {
		const review = await this.getReviewOrThrow(reviewId);

		if (review.userId !== userId) {
			throw new Error("Forbidden: Bạn không có quyền xóa đánh giá này.");
		}

		await prisma.review.delete({ where: { id: reviewId } });
	}

	// ==========================================
	// Admin / Moderation
	// ==========================================
	async listReviewsAdmin(params: ListReviewsAdminParams) {
		const where: Record<string, unknown> = {};

		if (params.productId) where.productId = Number(params.productId);
		if (params.userId) where.userId = Number(params.userId);
		if (params.rating) where.rating = Number(params.rating);
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

	/** Kiểm duyệt viên xóa bất kỳ review nào (vd: spam, ngôn từ không phù hợp), không giới hạn theo chủ sở hữu */
	async adminDeleteReview(reviewId: number) {
		await this.getReviewOrThrow(reviewId);
		await prisma.review.delete({ where: { id: reviewId } });
	}

	// ==========================================
	// Helpers
	// ==========================================
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
