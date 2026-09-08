import type { Socket } from "socket.io";
import type { TokenPayload } from "./middlewares/authenticate.js";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { parseCookie } from "cookie";
import jwt from "jsonwebtoken";
import { setIO, STAFF_SUPPORT_ROOM } from "./realtime/io-registry.js";
import { hasPermission } from "./middlewares/rbac.js";
import { registerConversationSocketHandlers } from "./features/conversations/conversation.socket.js";
import { registerMessageSocketHandlers } from "./features/messages/message.socket.js";

export interface SocketUser extends TokenPayload {}

/**
 * Xác thực JWT ngay lúc handshake — không tái sử dụng được middleware Express (`cookieParser`,
 * `authenticateJWT`) vì handshake của Socket.IO là 1 request HTTP riêng biệt, không đi qua chung
 * pipeline `app.use(...)`. Tự đọc cookie "accessToken" (đúng tên + đúng JWT_SECRET như
 * `middlewares/authenticate.ts`), verify thủ công. Kết nối bị từ chối ngay tại đây nếu thiếu/token
 * không hợp lệ — client sẽ nhận sự kiện "connect_error".
 */
const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
	try {
		const cookieHeader = socket.handshake.headers.cookie;
		if (!cookieHeader) {
			next(new Error("Unauthorized"));
			return;
		}

		const cookies = parseCookie(cookieHeader);
		const token = cookies.accessToken;
		if (!token) {
			next(new Error("Unauthorized"));
			return;
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as SocketUser;
		socket.data.user = decoded; // Lưu thông tin user vào socket.data để dùng trong các event handler
		next();
	} catch (error) {
		next(new Error("Unauthorized"));
	}
};

/**
 * Khởi tạo Socket.IO, gắn vào ĐÚNG `http.Server` mà Express đang chạy (không phải server riêng —
 * `app.listen()` ở server.ts trả về `http.Server`, dùng chung 1 cổng, không cần mở cổng mới). Gọi 1
 * lần lúc bootstrap ở server.ts, cùng chỗ với `startOrderCleanupJob()`/`startGhnShipmentRetryJob()`.
 */
export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
	const io = new SocketIOServer(httpServer, {
		cors: {
			origin: process.env.CLIENT_URL,
			credentials: true,
		},
		transports: ["websocket"],
	});
	setIO(io);

	io.use(socketAuthMiddleware);

	io.on("connection", (socket: Socket) => {
		const user = socket.data.user as SocketUser;

		// Staff/quản lý có quyền "conversation:manage" tự động vào phòng chung — nhận mọi cập nhật
		// của shared inbox (tin mới ở BẤT KỲ hội thoại nào, ai vừa nhận xử lý...) dù chưa mở đúng
		// conversation nào cụ thể. Khách hàng KHÔNG join room này.
		hasPermission(user.roleId, "conversation:manage")
			.then((isStaff) => {
				if (isStaff) {
					socket.join(STAFF_SUPPORT_ROOM);
				}
			})
			.catch((err) => {
				console.error("[socket] Lỗi kiểm tra quyền conversation:manage:", err);
			});

		registerConversationSocketHandlers(io, socket); // Gọi hàm đăng ký các event handler cho socket
		registerMessageSocketHandlers(io, socket); // Gọi hàm đăng ký các event handler cho socket
	});

	io.engine.on("connection_error", (err) => {
		console.error("[socket] Lỗi kết nối Socket.IO:", err.message);
	});

	console.log("[socket] Socket.IO đã khởi tạo, đang lắng nghe kết nối realtime.");
	return io;
};
