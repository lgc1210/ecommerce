import messageService from "./message.service.js";
/**
 * Handler MỎNG — chỉ xác thực quyền rồi gọi lại `messageService.sendMessage`, KHÔNG tự ghi DB hay
 * tự emit ở đây. Việc emit "new_message" nằm trong chính `messageService.sendMessage()` (dùng
 * `getIO()`), nên gửi tin qua REST hay qua socket đều tự động bắn realtime giống hệt nhau.
 */
export const registerMessageSocketHandlers = (_io, socket) => {
    const user = socket.data.user;
    socket.on("send_message", async (payload, ack) => {
        try {
            await messageService.assertCanAccessConversation(user, payload.conversationId);
            const message = await messageService.sendMessage(payload.conversationId, user.id, payload);
            ack?.({ ok: true, data: message });
        }
        catch (error) {
            ack?.({ ok: false, error: error instanceof Error ? error.message : "Không thể gửi tin nhắn." });
        }
    });
};
//# sourceMappingURL=message.socket.js.map