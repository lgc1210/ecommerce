import { io, type Socket } from "socket.io-client";

/**
 * Suy ra origin thật của backend (KHÔNG kèm "/api") từ VITE_API_BASE_URL để Socket.IO connect
 * đúng địa chỉ — Socket.IO luôn phục vụ ở đường dẫn gốc "/socket.io/", không nằm dưới "/api".
 * Nếu VITE_API_BASE_URL là URL tương đối (vd "/api", dùng chung origin qua Vite dev proxy hoặc
 * cùng domain khi build production) thì trả về undefined — `io()` sẽ tự connect same-origin.
 */
const resolveSocketUrl = (): string | undefined => {
	return import.meta.env.VITE_SOCKET_URL || undefined;
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
		});
	}
	return socket;
};
