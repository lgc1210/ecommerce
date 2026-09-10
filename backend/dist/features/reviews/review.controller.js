import reviewService from "./review.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
// ==========================================
// Public
// ==========================================
export const listReviewsByProduct = async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        const result = await reviewService.listReviewsByProduct(productId, req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Customer
// ==========================================
/** Danh sách review CHÍNH user hiện tại đã viết — dùng cho tab "Đánh giá của tôi" (sửa/xóa). */
export const listMyReviews = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await reviewService.listMyReviews(userId, req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const listReviewableOrderItems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const items = await reviewService.listReviewableOrderItems(userId);
        res.status(200).json({ data: items });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const createReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const review = await reviewService.createReview(userId, req.body);
        res.status(201).json({ message: "Đánh giá sản phẩm thành công.", data: review });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const updateReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const review = await reviewService.updateReview(userId, reviewId, req.body);
        res.status(200).json({ message: "Cập nhật đánh giá thành công.", data: review });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        await reviewService.deleteReview(userId, reviewId);
        res.status(200).json({ message: "Xóa đánh giá thành công." });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Admin / Moderation
// ==========================================
export const listReviewsAdmin = async (req, res, next) => {
    try {
        const result = await reviewService.listReviewsAdmin(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const hideReview = async (req, res, next) => {
    try {
        const actionByUserId = req.user.id;
        const reviewId = Number(req.params.id);
        const review = await reviewService.hideReview(actionByUserId, reviewId, req.body);
        res.status(200).json({ message: "Đã ẩn đánh giá.", data: review });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const unhideReview = async (req, res, next) => {
    try {
        const actionByUserId = req.user.id;
        const reviewId = Number(req.params.id);
        const review = await reviewService.unhideReview(actionByUserId, reviewId, req.body);
        res.status(200).json({ message: "Đã hiện lại đánh giá.", data: review });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const adminDeleteReview = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        await reviewService.adminDeleteReview(reviewId);
        res.status(200).json({ message: "Đã xóa đánh giá (kiểm duyệt)." });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Shop reply
// ==========================================
export const createReply = async (req, res, next) => {
    try {
        const repliedBy = req.user.id;
        const reviewId = Number(req.params.id);
        const reply = await reviewService.createReply(repliedBy, reviewId, req.body);
        res.status(201).json({ message: "Đã phản hồi đánh giá.", data: reply });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const updateReply = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        const reply = await reviewService.updateReply(reviewId, req.body);
        res.status(200).json({ message: "Đã cập nhật phản hồi.", data: reply });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const deleteReply = async (req, res, next) => {
    try {
        const reviewId = Number(req.params.id);
        await reviewService.deleteReply(reviewId);
        res.status(200).json({ message: "Đã xóa phản hồi." });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=review.controller.js.map