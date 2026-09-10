import type { TokenPayload } from "./middlewares/authenticate.js";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
export interface SocketUser extends TokenPayload {
}
/**
 * Khởi tạo Socket.IO, gắn vào ĐÚNG `http.Server` mà Express đang chạy (không phải server riêng —
 * `app.listen()` ở server.ts trả về `http.Server`, dùng chung 1 cổng, không cần mở cổng mới). Gọi 1
 * lần lúc bootstrap ở server.ts, cùng chỗ với `startOrderCleanupJob()`/`startGhnShipmentRetryJob()`.
 */
export declare const initSocketServer: (httpServer: HttpServer) => SocketIOServer;
//# sourceMappingURL=socket.server.d.ts.map