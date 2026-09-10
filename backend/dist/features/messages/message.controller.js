import messageService from "./message.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
export const listMessages = async (req, res, next) => {
    try {
        const conversationId = Number(req.params.conversationId);
        await messageService.assertCanAccessConversation(req.user, conversationId);
        const result = await messageService.listMessages(conversationId, req.query);
        res.status(200).json({ message: "OK", data: result.items, meta: { hasMore: result.hasMore } });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const sendMessage = async (req, res, next) => {
    try {
        const conversationId = Number(req.params.conversationId);
        await messageService.assertCanAccessConversation(req.user, conversationId);
        const message = await messageService.sendMessage(conversationId, req.user.id, req.body);
        res.status(201).json({ message: "Đã gửi tin nhắn.", data: message });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=message.controller.js.map