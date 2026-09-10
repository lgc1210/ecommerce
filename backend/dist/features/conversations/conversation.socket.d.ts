import type { Server, Socket } from "socket.io";
/**
 * Presence + typing indicator — thuần tuý ở tầng socket (tạm thời, không lưu DB — xem thảo luận
 * thiết kế), KHÔNG phải "domain action" nên không cần đi qua service/emit từ service như
 * send_message/assign. "Ai đang xem cuộc hội thoại này ngay lúc này" chỉ để hiện UI kiểu "Nhân viên
 * khác cũng đang xem hội thoại này" — không ảnh hưởng gì tới dữ liệu nghiệp vụ.
 */
export declare const registerConversationSocketHandlers: (io: Server, socket: Socket) => void;
//# sourceMappingURL=conversation.socket.d.ts.map