import { ConversationStatus } from "../../generated/prisma/index.js";
declare class ConversationService {
    /** Đọc 1 conversation kèm chi tiết, ném NotFound nếu không có — dùng lại ở khắp các hàm bên dưới. */
    getConversationOrThrow(id: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /**
     * Tìm conversation "open" hiện có của khách, hoặc tạo mới nếu chưa có — gọi khi khách bấm nút
     * "Chat". Không cần chờ có staff online: tin nhắn vẫn gửi/lưu được bình thường, staff xem sau
     * khi đăng nhập (xem thảo luận thiết kế — chat là bất đồng bộ, không phải "ghép cặp" như gọi thoại).
     */
    getOrCreateOwnConversation(customerId: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /** Đọc conversation "open" hiện tại của khách — CHỈ ĐỌC, không tạo mới (khác getOrCreateOwnConversation). Trả về null nếu khách chưa từng chat, không ném lỗi — "chưa có hội thoại" là trạng thái bình thường. */
    getOwnCurrentConversation(customerId: number): Promise<({
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }) | null>;
    /** Lấy 1 conversation của chính khách — chặn xem hội thoại của người khác dù đoán được id. */
    getOwnConversation(customerId: number, conversationId: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /** Shared inbox cho staff/quản lý — xem được TẤT CẢ hội thoại, không phụ thuộc assignedStaffId (chỉ dùng để lọc theo yêu cầu, không phải ACL — xem thảo luận thiết kế). */
    listConversationsForStaff(query: Record<string, any>): Promise<{
        items: ({
            customer: {
                email: string;
                id: number;
                name: string;
            };
            assignedStaff: {
                email: string;
                id: number;
                name: string;
            } | null;
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
            customerId: number;
            assignedStaffId: number | null;
            customerLastReadMessageId: number | null;
            staffLastReadMessageId: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * "Nhận xử lý" — atomic, tránh race condition khi 2 staff cùng bấm nhận 1 conversation chưa ai
     * nhận cùng lúc (xem thảo luận thiết kế). `updateMany` với điều kiện `assignedStaffId: null`
     * trong `where` đảm bảo CHỈ 1 trong 2 request thành công — MySQL/MariaDB tự đảm bảo atomic ở
     * tầng UPDATE, không cần transaction hay lock riêng.
     */
    assignToSelf(conversationId: number, staffId: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /** Đổi trạng thái hội thoại (vd đánh dấu "resolved" sau khi xử lý xong, hoặc "closed" để đóng hẳn). */
    updateStatus(conversationId: number, status: ConversationStatus): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /** Đánh dấu đã đọc — phía khách. */
    markReadByCustomer(conversationId: number, customerId: number, lastReadMessageId: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
    /** Đánh dấu đã đọc — phía shop. Bất kỳ staff/quản lý nào đọc cũng cập nhật CHUNG 1 cột này (2 phía cố định: khách vs shop — xem thảo luận thiết kế). */
    markReadByStaff(conversationId: number, lastReadMessageId: number): Promise<{
        customer: {
            email: string;
            id: number;
            name: string;
        };
        assignedStaff: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        status: import("../../generated/prisma/index.js").$Enums.ConversationStatus;
        customerId: number;
        assignedStaffId: number | null;
        customerLastReadMessageId: number | null;
        staffLastReadMessageId: number | null;
    }>;
}
declare const _default: ConversationService;
export default _default;
//# sourceMappingURL=conversation.service.d.ts.map