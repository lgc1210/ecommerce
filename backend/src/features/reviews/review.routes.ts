import { Router } from "express";
import { listReviewsByProduct, createReview, updateReview, deleteReview, listReviewsAdmin, adminDeleteReview } from "./review.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ListReviewsByProductQuerySchema, CreateReviewSchema, UpdateReviewSchema, ReviewIdParamSchema, ListReviewsAdminQuerySchema } from "./review.validation.js";
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
router.post("/", authenticateJWT, requirePermission("review:create"), validate(CreateReviewSchema), createReview);
router.patch("/:id", authenticateJWT, requirePermission("review:create"), validate(UpdateReviewSchema), updateReview);
router.delete("/:id", authenticateJWT, requirePermission("review:create"), validate(ReviewIdParamSchema), deleteReview);

// ==========================================
// Admin / Moderation (yêu cầu permission "review:update")
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("review:update"), validate(ListReviewsAdminQuerySchema), listReviewsAdmin);
router.delete("/admin/:id", authenticateJWT, requirePermission("review:update"), validate(ReviewIdParamSchema), adminDeleteReview);

export default router;
