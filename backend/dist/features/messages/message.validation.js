import { z } from "zod";
import { MessageType } from "../../generated/prisma/index.js";
import { numericIdString } from "../../shared/validation.js";
const messageTypeEnum = z.enum([MessageType.text, MessageType.image, MessageType.system]);
export const ListMessagesSchema = z.object({
    params: z.object({ conversationId: numericIdString }),
    query: z.object({
        beforeId: numericIdString.optional(),
        limit: numericIdString.optional(),
    }),
});
export const SendMessageSchema = z.object({
    params: z.object({ conversationId: numericIdString }),
    body: z
        .object({
        type: messageTypeEnum.default(MessageType.text),
        content: z.string().trim().min(1).max(5000).optional(),
        attachmentUrl: z.url().max(500).optional(),
    })
        // text phải có content; image/... nên có attachmentUrl — không bắt buộc cứng để chừa chỗ cho content là caption đi kèm ảnh
        .refine((data) => data.type !== "text" || !!data.content, {
        message: "Tin nhắn dạng text phải có nội dung.",
        path: ["content"],
    })
        .refine((data) => data.type === "text" || !!data.attachmentUrl || !!data.content, {
        message: "Tin nhắn phải có nội dung hoặc file đính kèm.",
        path: ["attachmentUrl"],
    }),
});
//# sourceMappingURL=message.validation.js.map