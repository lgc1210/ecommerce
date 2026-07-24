import { Router } from "express";
import { getOwnPayment, confirmOwnPayment, listPaymentsAdmin, getPaymentById, updatePaymentStatus } from "./payment.controller.js";
import { validate } from "../../middlewares/validate.js";
import { OwnPaymentParamSchema, ConfirmOwnPaymentSchema, ListPaymentsAdminQuerySchema, PaymentIdParamSchema, UpdatePaymentStatusSchema } from "./payment.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Self-service (yêu cầu đăng nhập; tái dùng permission "order:read"/"order:create" vì
// thanh toán luôn gắn liền 1-1 với đơn hàng của chính user, không có route admin nào ở đây)
// ==========================================
router.get("/me/:orderId", authenticateJWT, requirePermission("order:read"), validate(OwnPaymentParamSchema), getOwnPayment);
router.post("/me/:orderId/confirm", authenticateJWT, requirePermission("order:create"), validate(ConfirmOwnPaymentSchema), confirmOwnPayment);

// ==========================================
// Admin (yêu cầu permission "payment:read" để xem, "payment:manage" để đổi trạng thái)
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("payment:read"), validate(ListPaymentsAdminQuerySchema), listPaymentsAdmin);
router.get("/admin/:id", authenticateJWT, requirePermission("payment:read"), validate(PaymentIdParamSchema), getPaymentById);
router.patch("/admin/:id/status", authenticateJWT, requirePermission("payment:manage"), validate(UpdatePaymentStatusSchema), updatePaymentStatus);

export default router;
