import { Router } from "express";
import { getOrCreateOwnConversation, getOwnCurrentConversation, getOwnConversation, markOwnConversationRead, listConversationsAdmin, getConversationAdmin, assignConversationToSelf, updateConversationStatus, markStaffConversationRead, } from "./conversation.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ConversationIdParamSchema, MarkOwnConversationReadSchema, MarkStaffConversationReadSchema, AssignConversationSchema, UpdateConversationStatusSchema, ListConversationsQuerySchema, } from "./conversation.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";
const router = Router();
// ==========================================
// Self-service: hội thoại của chính khách hàng — 1 khách chỉ có tối đa 1 hội thoại "open"
// ==========================================
router.post("/me", authenticateJWT, requirePermission("conversation:create"), getOrCreateOwnConversation);
router.get("/me", authenticateJWT, requirePermission("conversation:create"), getOwnCurrentConversation);
router.get("/me/:id", authenticateJWT, requirePermission("conversation:create"), validate(ConversationIdParamSchema), getOwnConversation);
router.patch("/me/:id/read", authenticateJWT, requirePermission("conversation:create"), validate(MarkOwnConversationReadSchema), markOwnConversationRead);
// ==========================================
// Staff/quản lý: shared inbox — bất kỳ ai có quyền conversation:manage đều xem/xử lý được MỌI
// hội thoại, không phụ thuộc assignedStaffId (chỉ là field routing/hiển thị, không phải ACL)
// ==========================================
router.get("/", authenticateJWT, requirePermission("conversation:manage"), validate(ListConversationsQuerySchema), listConversationsAdmin);
router.get("/:id", authenticateJWT, requirePermission("conversation:manage"), validate(ConversationIdParamSchema), getConversationAdmin);
router.patch("/:id/assign", authenticateJWT, requirePermission("conversation:manage"), validate(AssignConversationSchema), assignConversationToSelf);
router.patch("/:id/status", authenticateJWT, requirePermission("conversation:manage"), validate(UpdateConversationStatusSchema), updateConversationStatus);
router.patch("/:id/read", authenticateJWT, requirePermission("conversation:manage"), validate(MarkStaffConversationReadSchema), markStaffConversationRead);
export default router;
//# sourceMappingURL=conversation.routes.js.map