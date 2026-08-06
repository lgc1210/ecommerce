import { Router } from "express";
import { getOwnPayment, confirmOwnPayment, listPaymentsAdmin, getPaymentById, updatePaymentStatus } from "./payment.controller.js";
import { createPaymentUrl, handleVnpayReturn, handleVnpayIpn, handleZalopayCallback } from "./payment-gateway.controller.js";
import { validate } from "../../middlewares/validate.js";
import { OwnPaymentParamSchema, ConfirmOwnPaymentSchema, ListPaymentsAdminQuerySchema, PaymentIdParamSchema, UpdatePaymentStatusSchema } from "./payment.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Cổng thanh toán online (VNPay/ZaloPay/...) — return/IPN KHÔNG có auth vì do chính gateway gọi
// trực tiếp (trình duyệt redirect / server-to-server), không phải người dùng đăng nhập. Đặt TRƯỚC
// các route "/me/:orderId..." bên dưới để tránh Express hiểu nhầm "vnpay"/"zalopay" là 1 orderId.
// ==========================================
router.get("/vnpay/return", handleVnpayReturn);
router.get("/vnpay/ipn", handleVnpayIpn);
router.post("/zalopay/callback", handleZalopayCallback);

// ==========================================
// Self-service (yêu cầu đăng nhập; tái dùng permission "order:read"/"order:create" vì
// thanh toán luôn gắn liền 1-1 với đơn hàng của chính user, không có route admin nào ở đây)
// ==========================================
router.get("/me/:orderId", authenticateJWT, requirePermission("order:read"), validate(OwnPaymentParamSchema), getOwnPayment);
router.post("/me/:orderId/confirm", authenticateJWT, requirePermission("order:create"), validate(ConfirmOwnPaymentSchema), confirmOwnPayment);
// Tạo URL thanh toán qua cổng online (VNPay/ZaloPay/...) cho đơn của chính mình — gateway suy ra
// từ payment.paymentMethod đã chốt lúc checkout, khách không tự chọn lại ở bước này.
router.post("/me/:orderId/pay", authenticateJWT, requirePermission("order:create"), validate(OwnPaymentParamSchema), createPaymentUrl);

// ==========================================
// Admin (yêu cầu permission "payment:read" để xem, "payment:manage" để đổi trạng thái)
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("payment:read"), validate(ListPaymentsAdminQuerySchema), listPaymentsAdmin);
router.get("/admin/:id", authenticateJWT, requirePermission("payment:read"), validate(PaymentIdParamSchema), getPaymentById);
router.patch("/admin/:id/status", authenticateJWT, requirePermission("payment:manage"), validate(UpdatePaymentStatusSchema), updatePaymentStatus);

export default router;
