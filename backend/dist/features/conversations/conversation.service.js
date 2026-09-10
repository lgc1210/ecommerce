import prisma from "../../config/prisma.js";
import { ConversationStatus } from "../../generated/prisma/index.js";
import { conversationRoom, getIO, STAFF_SUPPORT_ROOM } from "../../realtime/io-registry.js";
import { parsePagination } from "../../utils/index.js";
const conversationDetailInclude = {
    customer: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    assignedStaff: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
};
class ConversationService {
    /** Đọc 1 conversation kèm chi tiết, ném NotFound nếu không có — dùng lại ở khắp các hàm bên dưới. */
    async getConversationOrThrow(id) {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: conversationDetailInclude,
        });
        if (!conversation) {
            throw new Error("NotFound: Không tìm thấy hội thoại này.");
        }
        return conversation;
    }
    /**
     * Tìm conversation "open" hiện có của khách, hoặc tạo mới nếu chưa có — gọi khi khách bấm nút
     * "Chat". Không cần chờ có staff online: tin nhắn vẫn gửi/lưu được bình thường, staff xem sau
     * khi đăng nhập (xem thảo luận thiết kế — chat là bất đồng bộ, không phải "ghép cặp" như gọi thoại).
     */
    async getOrCreateOwnConversation(customerId) {
        const existing = await prisma.conversation.findFirst({
            where: { customerId, status: ConversationStatus.open },
            include: conversationDetailInclude,
            orderBy: { createdAt: "desc" },
        });
        if (existing)
            return existing;
        const conversation = await prisma.conversation.create({
            data: { customerId, status: ConversationStatus.open },
            include: conversationDetailInclude,
        });
        // Hội thoại mới toanh -> báo ngay cho shared inbox, staff thấy xuất hiện mà không cần F5.
        getIO()?.to(STAFF_SUPPORT_ROOM).emit("conversation:new", conversation);
        return conversation;
    }
    /** Đọc conversation "open" hiện tại của khách — CHỈ ĐỌC, không tạo mới (khác getOrCreateOwnConversation). Trả về null nếu khách chưa từng chat, không ném lỗi — "chưa có hội thoại" là trạng thái bình thường. */
    async getOwnCurrentConversation(customerId) {
        return prisma.conversation.findFirst({
            where: { customerId, status: ConversationStatus.open },
            include: conversationDetailInclude,
            orderBy: { createdAt: "desc" },
        });
    }
    /** Lấy 1 conversation của chính khách — chặn xem hội thoại của người khác dù đoán được id. */
    async getOwnConversation(customerId, conversationId) {
        const conversation = await this.getConversationOrThrow(conversationId);
        if (conversation.customerId !== customerId) {
            throw new Error("NotFound: Không tìm thấy hội thoại này.");
        }
        return conversation;
    }
    /** Shared inbox cho staff/quản lý — xem được TẤT CẢ hội thoại, không phụ thuộc assignedStaffId (chỉ dùng để lọc theo yêu cầu, không phải ACL — xem thảo luận thiết kế). */
    async listConversationsForStaff(query) {
        const { page, limit, skip } = parsePagination(query);
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.assignedStaffId === "unassigned") {
            where.assignedStaffId = null;
        }
        else if (query.assignedStaffId) {
            where.assignedStaffId = Number(query.assignedStaffId);
        }
        const [items, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                include: conversationDetailInclude,
                orderBy: { updatedAt: "desc" }, // hội thoại có hoạt động gần nhất lên đầu
                skip,
                take: limit,
            }),
            prisma.conversation.count({ where }),
        ]);
        return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
    }
    /**
     * "Nhận xử lý" — atomic, tránh race condition khi 2 staff cùng bấm nhận 1 conversation chưa ai
     * nhận cùng lúc (xem thảo luận thiết kế). `updateMany` với điều kiện `assignedStaffId: null`
     * trong `where` đảm bảo CHỈ 1 trong 2 request thành công — MySQL/MariaDB tự đảm bảo atomic ở
     * tầng UPDATE, không cần transaction hay lock riêng.
     */
    async assignToSelf(conversationId, staffId) {
        const result = await prisma.conversation.updateMany({
            where: { id: conversationId, assignedStaffId: null },
            data: { assignedStaffId: staffId },
        });
        if (result.count === 0) {
            // count = 0 nghĩa là 1 trong 2 khả năng: (1) conversation không tồn tại, hoặc (2) đã có
            // người khác nhận trước trong lúc mình bấm -> đọc lại để phân biệt + báo đúng lý do.
            const current = await this.getConversationOrThrow(conversationId);
            throw new Error(`Conflict: Hội thoại này đã được ${current.assignedStaff?.name ?? "người khác"} nhận xử lý`);
        }
        const conversation = await this.getConversationOrThrow(conversationId);
        const io = getIO();
        if (io) {
            io.to(STAFF_SUPPORT_ROOM).emit("conversation:updated", conversation);
            io.to(conversationRoom(conversationId)).emit("conversation:updated", conversation);
        }
        return conversation;
    }
    /** Đổi trạng thái hội thoại (vd đánh dấu "resolved" sau khi xử lý xong, hoặc "closed" để đóng hẳn). */
    async updateStatus(conversationId, status) {
        await this.getConversationOrThrow(conversationId);
        const conversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: { status },
            include: conversationDetailInclude,
        });
        const io = getIO();
        if (io) {
            io.to(STAFF_SUPPORT_ROOM).emit("conversation:updated", conversation);
            // Khách đang mở đúng cuộc này cũng cần biết ngay (vd hội thoại vừa bị đóng).
            io.to(conversationRoom(conversationId)).emit("conversation:updated", conversation);
        }
        return conversation;
    }
    /** Đánh dấu đã đọc — phía khách. */
    async markReadByCustomer(conversationId, customerId, lastReadMessageId) {
        const conversation = await this.getOwnConversation(customerId, conversationId);
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { customerLastReadMessageId: lastReadMessageId },
        });
        return conversation;
    }
    /** Đánh dấu đã đọc — phía shop. Bất kỳ staff/quản lý nào đọc cũng cập nhật CHUNG 1 cột này (2 phía cố định: khách vs shop — xem thảo luận thiết kế). */
    async markReadByStaff(conversationId, lastReadMessageId) {
        const conversation = await this.getConversationOrThrow(conversationId);
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { staffLastReadMessageId: lastReadMessageId },
        });
        return conversation;
    }
}
export default new ConversationService();
//# sourceMappingURL=conversation.service.js.map