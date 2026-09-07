import type { Server, Socket } from "socket.io";
import type { SocketUser } from "../../socket.server.js";
import { conversationRoom } from "../../realtime/io-registry.js";
import messageService from "../messages/message.service.js";

interface PresenceUser {
	id: number;
	email: string;
}

/** Đọc danh sách đầy đủ những ai ĐANG có mặt trong room ngay tại thời điểm gọi — an toàn hơn dồn
 * tích các sự kiện joined/left rời rạc phía client (dễ lệch nếu bỏ lỡ 1 sự kiện do mất kết nối tạm thời). */
const getRoomPresence = (io: Server, room: string): PresenceUser[] => {
	const socketIds = io.sockets.adapter.rooms.get(room);
	if (!socketIds) return [];

	const users: PresenceUser[] = [];
	for (const socketId of socketIds) {
		const socket = io.sockets.sockets.get(socketId);
		const user = socket?.data.user as SocketUser | undefined;
		if (user) users.push({ id: user.id, email: user.email });
	}

	return users;
};

/**
 * Presence + typing indicator — thuần tuý ở tầng socket (tạm thời, không lưu DB — xem thảo luận
 * thiết kế), KHÔNG phải "domain action" nên không cần đi qua service/emit từ service như
 * send_message/assign. "Ai đang xem cuộc hội thoại này ngay lúc này" chỉ để hiện UI kiểu "Nhân viên
 * khác cũng đang xem hội thoại này" — không ảnh hưởng gì tới dữ liệu nghiệp vụ.
 */
export const registerConversationSocketHandlers = (io: Server, socket: Socket): void => {
	const user = socket.data.user as SocketUser;

	socket.on(
		"join_conversation",
		async (
			conversationId: number,
			ack?: (response: { ok: boolean; error?: string; presence?: PresenceUser[] }) => void,
		) => {
			try {
				await messageService.assertCanAccessConversation(user, conversationId);
				const room = conversationRoom(conversationId);
				socket.join(room);

				// Báo cho những người ĐANG có mặt sẵn trong room biết có người mới vào — broadcast SAU
				// khi join xong, không tính chính socket này (socket.to loại trừ sender tự động).
				socket.to(room).emit("presence:joined", { id: user.id, email: user.email });

				ack?.({ ok: true, presence: getRoomPresence(io, room) });
			} catch (error: unknown) {
				ack?.({ ok: false, error: error instanceof Error ? error.message : "Không thể tham gia hội thoại." });
			}
		},
	);

	socket.on("leave_conversation", (conversationId: number) => {
		const room = conversationRoom(conversationId);
		socket.leave(room);
		socket.to(room).emit("presence:left", { id: user.id, email: user.email });
	});

	socket.on("typing", (conversationId: number, isTyping: boolean) => {
		socket.to(conversationRoom(conversationId)).emit("typing", { id: user.id, email: user.email, isTyping });
	});

	// "disconnecting" (KHÔNG phải "disconnect") — bắn ra TRƯỚC khi Socket.IO tự động rời hết các
	// room, nên `socket.rooms` ở đây vẫn còn đầy đủ danh sách room đang tham gia lúc mất kết nối.
	socket.on("disconnecting", () => {
		for (const room of socket.rooms) {
			if (room.startsWith("conversation:")) {
				socket.to(room).emit("presence:left", { id: user.id, email: user.email });
			}
		}
	});
};
