import { io, type Socket } from "socket.io-client";

/**
 * Socket.IO được mount ở root của backend, không nằm dưới "/api". Production có thể dùng
 * VITE_SOCKET_URL riêng (cần thiết khi API đang được proxy qua một host khác); nếu không có,
 * dùng origin của VITE_API_BASE_URL khi đó là một URL tuyệt đối.
 */
const resolveSocketUrl = (): string | undefined => {
	const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
	if (socketUrl) return socketUrl;

	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
	if (!apiBaseUrl) return undefined;

	try {
		return new URL(apiBaseUrl).origin;
	} catch {
		return undefined;
	}
};

let socket: Socket | null = null;

/**
 * Socket.IO client — 1 instance DUY NHẤT dùng chung toàn app (cả trang khách lẫn trang admin),
 * không tự động connect (`autoConnect: false`) — việc connect/disconnect do `useSocketConnection()`
 * (xem cùng thư mục) tự quản lý theo trạng thái đăng nhập, tránh khách chưa đăng nhập cũng mở kết
 * nối vô ích. `withCredentials: true` để cookie "accessToken" (httpOnly) được gửi kèm lúc handshake
 * — khớp với cách BE xác thực (xem backend `realtime/socket.server.ts`).
 */
export const getSocket = (): Socket => {
	if (!socket) {
		socket = io(resolveSocketUrl(), {
			withCredentials: true,
			autoConnect: false,
			transports: ["websocket"],
		});
	}
	return socket;
};
