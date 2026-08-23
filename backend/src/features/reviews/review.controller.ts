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
/** Danh sách review CHÍNH user hiện tại đã viết — dùng cho tab "Đánh giá của tôi" (sửa/xóa). */
export const listMyReviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const result = await reviewService.listMyReviews(userId, req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const listReviewableOrderItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const items = await reviewService.listReviewableOrderItems(userId);
		res.status(200).json({ data: items });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

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

export const hideReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const actionByUserId = req.user!.id;
		const reviewId = Number(req.params.id);
		const review = await reviewService.hideReview(actionByUserId, reviewId, req.body);
		res.status(200).json({ message: "Đã ẩn đánh giá.", data: review });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const unhideReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const actionByUserId = req.user!.id;
		const reviewId = Number(req.params.id);
		const review = await reviewService.unhideReview(actionByUserId, reviewId, req.body);
		res.status(200).json({ message: "Đã hiện lại đánh giá.", data: review });
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

// ==========================================
// Shop reply
// ==========================================
export const createReply = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const repliedBy = req.user!.id;
		const reviewId = Number(req.params.id);
		const reply = await reviewService.createReply(repliedBy, reviewId, req.body);
		res.status(201).json({ message: "Đã phản hồi đánh giá.", data: reply });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const reviewId = Number(req.params.id);
		const reply = await reviewService.updateReply(reviewId, req.body);
		res.status(200).json({ message: "Đã cập nhật phản hồi.", data: reply });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const reviewId = Number(req.params.id);
		await reviewService.deleteReply(reviewId);
		res.status(200).json({ message: "Đã xóa phản hồi." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
