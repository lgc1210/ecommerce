import { Router } from "express";
import { listOwnNotifications, markAsRead, markAllAsRead, deleteOwnNotification, deleteAllReadNotifications, broadcastNotification } from "./notification.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ListOwnNotificationsQuerySchema, NotificationIdParamSchema, BroadcastNotificationSchema } from "./notification.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Customer (self-service) — mọi user đăng nhập đều truy cập được thông báo của chính mình,
// không cần permission riêng (tương tự cart:manage — dữ liệu tự sở hữu, không phải RBAC resource).
// ==========================================
router.get("/", authenticateJWT, validate(ListOwnNotificationsQuerySchema), listOwnNotifications);
router.patch("/read-all", authenticateJWT, markAllAsRead);
router.patch("/:id/read", authenticateJWT, validate(NotificationIdParamSchema), markAsRead);
// "/read" (xóa hàng loạt) PHẢI đứng TRƯỚC "/:id" (xóa 1 cái) — Express match theo thứ tự đăng ký,
// nếu để "/:id" trước thì DELETE /notifications/read sẽ bị nuốt luôn thành id="read" (NaN), không
// bao giờ chạm tới được deleteAllReadNotifications.
router.delete("/read", authenticateJWT, deleteAllReadNotifications);
router.delete("/:id", authenticateJWT, validate(NotificationIdParamSchema), deleteOwnNotification);

// ==========================================
// Admin: broadcast thông báo hệ thống/khuyến mãi tới nhiều user
// ==========================================
router.post("/broadcast", authenticateJWT, requirePermission("notification:broadcast"), validate(BroadcastNotificationSchema), broadcastNotification);

export default router;
