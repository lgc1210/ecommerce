import type { Server, Socket } from "socket.io";
/**
 * Handler MỎNG — chỉ xác thực quyền rồi gọi lại `messageService.sendMessage`, KHÔNG tự ghi DB hay
 * tự emit ở đây. Việc emit "new_message" nằm trong chính `messageService.sendMessage()` (dùng
 * `getIO()`), nên gửi tin qua REST hay qua socket đều tự động bắn realtime giống hệt nhau.
 */
export declare const registerMessageSocketHandlers: (_io: Server, socket: Socket) => void;
//# sourceMappingURL=message.socket.d.ts.map