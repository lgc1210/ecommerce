import { Router } from "express";
import { checkout, previewShippingFee, listOwnOrders, getOwnOrderById, cancelOwnOrder, listOrdersAdmin, getOrderById, updateOrderStatus } from "./order.controller.js";
import { validate } from "../../middlewares/validate.js";
import { CreateOrderSchema, PreviewShippingFeeSchema, ListOwnOrdersQuerySchema, OrderIdParamSchema, ListOrdersAdminQuerySchema, UpdateOrderStatusSchema } from "./order.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Self-service (yêu cầu đăng nhập; permission "order:create" để đặt/hủy đơn, "order:read" để xem đơn của chính mình)
// ==========================================
router.post("/", authenticateJWT, requirePermission("order:create"), validate(CreateOrderSchema), checkout);
// Tính trước phí vận chuyển GHN theo giỏ hàng + địa chỉ, để FE hiển thị cho khách trước khi đặt hàng
router.post("/shipping-fee", authenticateJWT, requirePermission("order:create"), validate(PreviewShippingFeeSchema), previewShippingFee);
router.get("/me", authenticateJWT, requirePermission("order:read"), validate(ListOwnOrdersQuerySchema), listOwnOrders);
router.get("/me/:id", authenticateJWT, requirePermission("order:read"), validate(OrderIdParamSchema), getOwnOrderById);
router.patch("/me/:id/cancel", authenticateJWT, requirePermission("order:create"), validate(OrderIdParamSchema), cancelOwnOrder);

// ==========================================
// Admin (yêu cầu permission "order:update" — CHỦ Ý dùng "order:update" thay vì "order:read" cho
// cả 2 route GET bên dưới: "order:read" hiện đang được cấp cho CẢ role "customer" (xem đơn của
// chính mình) lẫn "manager" (per rbac.seed.ts). Nếu dùng "order:read" ở đây, một khách hàng bình
// thường sẽ vô tình có quyền xem TOÀN BỘ đơn hàng của mọi người qua route admin. "order:update"
// chỉ được cấp cho manager/admin, nên dùng nó để tách hẳn quyền truy cập admin khỏi self-service.
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("order:update"), validate(ListOrdersAdminQuerySchema), listOrdersAdmin);
router.get("/admin/:id", authenticateJWT, requirePermission("order:update"), validate(OrderIdParamSchema), getOrderById);
router.patch("/admin/:id/status", authenticateJWT, requirePermission("order:update"), validate(UpdateOrderStatusSchema), updateOrderStatus);

export default router;
