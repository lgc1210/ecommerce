import { MessageType } from "../../generated/prisma/index.js";
declare class MessageService {
    /**
     * Route `/messages/:conversationId` dùng CHUNG cho cả khách lẫn staff. Vì `requirePermission`
     * chỉ check được 1 permission cố định, không tự nhiên diễn tả được "HOẶC", nên việc phân quyền
     * "khách của đúng hội thoại này HOẶC staff có quyền conversation:manage" phải tự kiểm tra ở đây.
     */
    assertCanAccessConversation(user: {
        id: number;
        roleId: number;
    }, conversationId: number): Promise<{
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
    /** Lấy lịch sử tin nhắn của 1 hội thoại, phân trang theo cursor `id` (mới nhất trước — đảo lại thứ tự khi hiển thị ở FE). */
    listMessages(conversationId: number, query: Record<string, string>): Promise<{
        items: ({
            sender: {
                email: string;
                id: number;
                name: string;
            };
        } & {
            type: import("../../generated/prisma/index.js").$Enums.MessageType;
            id: number;
            createdAt: Date | null;
            conversationId: number;
            senderId: number;
            content: string | null;
            attachmentUrl: string | null;
        })[];
        hasMore: boolean;
    }>;
    /**
     * Gửi 1 tin nhắn — persist DB trước, rồi tự bắn realtime qua `getIO()` ngay tại đây. Cả REST
     * (`POST /messages/:conversationId`) lẫn socket (sự kiện "send_message") đều gọi vào ĐÚNG hàm
     * này, nên hành vi emit luôn nhất quán, không viết lặp ở 2 nơi.
     */
    sendMessage(conversationId: number, senderId: number, input: {
        type?: MessageType;
        content?: string;
        attachmentUrl?: string;
    }): Promise<{
        sender: {
            email: string;
            id: number;
            name: string;
        };
    } & {
        type: import("../../generated/prisma/index.js").$Enums.MessageType;
        id: number;
        createdAt: Date | null;
        conversationId: number;
        senderId: number;
        content: string | null;
        attachmentUrl: string | null;
    }>;
}
declare const _default: MessageService;
export default _default;
//# sourceMappingURL=message.service.d.ts.map