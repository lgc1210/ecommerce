import { Router } from "express";
import { listMessages, sendMessage } from "./message.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ListMessagesSchema, SendMessageSchema } from "./message.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";

const router = Router();

// Dùng CHUNG cho cả khách lẫn staff — phân quyền tự check bên trong service
// (messageService.assertCanAccessConversation), không đặt requirePermission ở đây vì cần biểu
// diễn "khách của đúng hội thoại này HOẶC staff có quyền conversation:manage" (OR 2 điều kiện khác
// nhau), điều mà requirePermission không tự nhiên diễn tả được.
router.get("/:conversationId", authenticateJWT, validate(ListMessagesSchema), listMessages);
router.post("/:conversationId", authenticateJWT, validate(SendMessageSchema), sendMessage);

export default router;
