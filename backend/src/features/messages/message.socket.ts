import type { Server, Socket } from "socket.io";
import messageService from "./message.service.js";
import type { MessageType } from "../../generated/prisma/index.js";
import type { SocketUser } from "../../socket.server.js";

interface SendMessagePayload {
	conversationId: number;
	type?: MessageType;
	content?: string;
	attachmentUrl?: string;
}

/**
 * Handler MỎNG — chỉ xác thực quyền rồi gọi lại `messageService.sendMessage`, KHÔNG tự ghi DB hay
 * tự emit ở đây. Việc emit "new_message" nằm trong chính `messageService.sendMessage()` (dùng
 * `getIO()`), nên gửi tin qua REST hay qua socket đều tự động bắn realtime giống hệt nhau.
 */
export const registerMessageSocketHandlers = (_io: Server, socket: Socket): void => {
	const user = socket.data.user as SocketUser;

	socket.on(
		"send_message",
		async (payload: SendMessagePayload, ack?: (response: { ok: boolean; error?: string; data?: unknown }) => void) => {
			try {
				await messageService.assertCanAccessConversation(user, payload.conversationId);
				const message = await messageService.sendMessage(payload.conversationId, user.id, payload);
				ack?.({ ok: true, data: message });
			} catch (error: unknown) {
				ack?.({ ok: false, error: error instanceof Error ? error.message : "Không thể gửi tin nhắn." });
			}
		},
	);
};
