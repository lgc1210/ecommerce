import prisma from "../../config/prisma.js";
import { ConversationStatus, MessageType } from "../../generated/prisma/index.js";
import { hasPermission } from "../../middlewares/rbac.js";
import conversationService from "../conversations/conversation.service.js";
import { getIO, conversationRoom, STAFF_SUPPORT_ROOM } from "../../realtime/io-registry.js";

const messageSenderInclude = {
	sender: {
		select: {
			id: true,
			name: true,
			email: true,
		},
	},
};

class MessageService {
	/**
	 * Route `/messages/:conversationId` dùng CHUNG cho cả khách lẫn staff. Vì `requirePermission`
	 * chỉ check được 1 permission cố định, không tự nhiên diễn tả được "HOẶC", nên việc phân quyền
	 * "khách của đúng hội thoại này HOẶC staff có quyền conversation:manage" phải tự kiểm tra ở đây.
	 */
	async assertCanAccessConversation(user: { id: number; roleId: number }, conversationId: number) {
		const conversation = await conversationService.getConversationOrThrow(conversationId);

		const isOwner = conversation.customerId === user.id;
		if (isOwner) return conversation;

		const isStaff = await hasPermission(user.roleId, "conversation:manage");
		if (isStaff) return conversation;

		throw new Error("Forbidden: Bạn không có quyền truy cập hội thoại này.");
	}

	/** Lấy lịch sử tin nhắn của 1 hội thoại, phân trang theo cursor `id` (mới nhất trước — đảo lại thứ tự khi hiển thị ở FE). */
	async listMessages(conversationId: number, query: Record<string, string>) {
		const beforeId = query.beforeId ? Number(query.beforeId) : undefined;
		const limit = Math.min(Math.max(query.limit ? Number(query.limit) : 30, 1), 100);

		const messages = await prisma.message.findMany({
			where: {
				conversationId,
				...(beforeId ? { id: { lt: beforeId } } : {}),
			},
			include: messageSenderInclude,
			orderBy: { id: "desc" },
			take: limit,
		});

		return { items: messages, hasMore: messages.length === limit };
	}

	/**
	 * Gửi 1 tin nhắn — persist DB trước, rồi tự bắn realtime qua `getIO()` ngay tại đây. Cả REST
	 * (`POST /messages/:conversationId`) lẫn socket (sự kiện "send_message") đều gọi vào ĐÚNG hàm
	 * này, nên hành vi emit luôn nhất quán, không viết lặp ở 2 nơi.
	 */
	async sendMessage(
		conversationId: number,
		senderId: number,
		input: { type?: MessageType; content?: string; attachmentUrl?: string },
	) {
		// Chặn gửi tin khi hội thoại không còn "open"
		const conversation = await conversationService.getConversationOrThrow(conversationId);
		if (conversation.status !== ConversationStatus.open) {
			throw new Error(
				`BadRequest: Hội thoại này đã ở trạng thái "${conversation.status}", không thể gửi thêm tin nhắn.`,
			);
		}

		const message = await prisma.message.create({
			data: {
				conversationId,
				senderId,
				type: input.type ?? MessageType.text,
				content: input.content ?? null,
				attachmentUrl: input.attachmentUrl ?? null,
			},
			include: messageSenderInclude,
		});

		// Bump updatedAt để danh sách hội thoại (sort theo hoạt động gần nhất) phản ánh đúng ngay.
		await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

		// Bắn realtime — best-effort, KHÔNG được để lỗi ở đây làm hỏng việc gửi tin (tin đã lưu DB
		// thành công rồi, đây chỉ là thông báo thêm). getIO() trả null nếu socket server chưa khởi
		// tạo (vd test) -> bỏ qua, REST vẫn phải trả về đúng tin nhắn vừa tạo dù không có socket.
		const io = getIO();
		if (io) {
			io.to(conversationRoom(conversationId)).emit("new_message", message);
			io.to(STAFF_SUPPORT_ROOM).emit("conversation:new_message", { conversationId, message });
		}

		return message;
	}
}

export default new MessageService();
