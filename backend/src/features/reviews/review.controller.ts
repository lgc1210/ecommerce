import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import reviewService from "./review.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Public
// ==========================================
export const listReviewsByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.productId);
		const result = await reviewService.listReviewsByProduct(productId, req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Customer
// ==========================================
export const createReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const review = await reviewService.createReview(userId, req.body);
		res.status(201).json({ message: "Đánh giá sản phẩm thành công.", data: review });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const reviewId = Number(req.params.id);
		const review = await reviewService.updateReview(userId, reviewId, req.body);
		res.status(200).json({ message: "Cập nhật đánh giá thành công.", data: review });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const reviewId = Number(req.params.id);
		await reviewService.deleteReview(userId, reviewId);
		res.status(200).json({ message: "Xóa đánh giá thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin / Moderation
// ==========================================
export const listReviewsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await reviewService.listReviewsAdmin(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const adminDeleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const reviewId = Number(req.params.id);
		await reviewService.adminDeleteReview(reviewId);
		res.status(200).json({ message: "Đã xóa đánh giá (kiểm duyệt)." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
