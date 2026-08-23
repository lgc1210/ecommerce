import { Router } from "express";
import {
	listReviewsByProduct,
	listReviewableOrderItems,
	createReview,
	updateReview,
	deleteReview,
	listReviewsAdmin,
	hideReview,
	unhideReview,
	adminDeleteReview,
	createReply,
	updateReply,
	deleteReply,
	listMyReviews,
} from "./review.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	ListReviewsByProductQuerySchema,
	CreateReviewSchema,
	UpdateReviewSchema,
	ReviewIdParamSchema,
	ListReviewsAdminQuerySchema,
	ModerateReviewSchema,
	CreateReviewReplySchema,
	UpdateReviewReplySchema,
	ListMyReviewsQuerySchema,
} from "./review.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Public (không yêu cầu đăng nhập)
// ==========================================
router.get("/product/:productId", validate(ListReviewsByProductQuerySchema), listReviewsByProduct);

// ==========================================
// Customer (yêu cầu permission "review:create"; quyền sở hữu được service kiểm tra thêm cho sửa/xóa)
// ==========================================
router.get("/reviewable-items", authenticateJWT, requirePermission("review:create"), listReviewableOrderItems);
router.get("/me", authenticateJWT, requirePermission("review:create"), validate(ListMyReviewsQuerySchema), listMyReviews);
router.post("/", authenticateJWT, requirePermission("review:create"), validate(CreateReviewSchema), createReview);
router.patch("/:id", authenticateJWT, requirePermission("review:create"), validate(UpdateReviewSchema), updateReview);
router.delete("/:id", authenticateJWT, requirePermission("review:create"), validate(ReviewIdParamSchema), deleteReview);

// ==========================================
// Admin / Moderation (yêu cầu permission "review:update")
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("review:update"), validate(ListReviewsAdminQuerySchema), listReviewsAdmin);
router.patch("/admin/:id/hide", authenticateJWT, requirePermission("review:update"), validate(ModerateReviewSchema), hideReview);
router.patch("/admin/:id/unhide", authenticateJWT, requirePermission("review:update"), validate(ModerateReviewSchema), unhideReview);
router.delete("/admin/:id", authenticateJWT, requirePermission("review:update"), validate(ReviewIdParamSchema), adminDeleteReview);

// Phản hồi chính thức của Shop/Admin dưới review — dùng chung permission "review:update"
router.post("/admin/:id/reply", authenticateJWT, requirePermission("review:update"), validate(CreateReviewReplySchema), createReply);
router.patch("/admin/:id/reply", authenticateJWT, requirePermission("review:update"), validate(UpdateReviewReplySchema), updateReply);
router.delete("/admin/:id/reply", authenticateJWT, requirePermission("review:update"), validate(ReviewIdParamSchema), deleteReply);

export default router;
