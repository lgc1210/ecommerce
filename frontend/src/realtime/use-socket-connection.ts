import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "./socket-client";
import { useAuth, AUTH_ME_QUERY_KEY } from "../features/auth/hooks/useAuth";

/**
 * Quản lý vòng đời kết nối Socket.IO theo trạng thái đăng nhập — connect khi đã đăng nhập, ngắt
 * kết nối khi đăng xuất (hoặc unmount). Gọi hook này ĐÚNG 1 LẦN ở gốc app (xem App.tsx) — không
 * gọi lặp lại ở từng trang, vì socket là 1 instance singleton dùng chung (xem socket-client.ts).
 *
 * Xử lý 1 trường hợp biên đáng chú ý: accessToken (cookie httpOnly, sống ngắn) có thể hết hạn
 * trong lúc socket đang giữ kết nối lâu dài — khi đó nếu mạng chập chờn khiến socket phải
 * reconnect, trình duyệt vẫn gửi kèm accessToken CŨ đã hết hạn, bị BE từ chối ngay lúc handshake
 * (xem "connect_error"). Xử lý bằng cách gọi lại /auth/me — nếu accessToken thật sự hết hạn,
 * request đó nhận 401 và tự kích hoạt cơ chế refresh token có sẵn trong apiClient (xem
 * configs/apis/index.ts), set lại cookie accessToken mới — rồi mới thử connect lại.
 */
export const useSocketConnection = (): void => {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	useEffect(() => {
		const socket = getSocket();

		if (!isAuthenticated) {
			socket.disconnect();
			return;
		}

		let isRecovering = false; // chặn chồng nhiều lượt refetch+connect cùng lúc nếu connect_error bắn dồn dập

		const handleConnectError = (error: Error) => {
			// SỬA — CHỈ xử lý đúng "Unauthorized" (message BE trả về khi thiếu/hết hạn accessToken,
			// xem backend socket.server.ts -> socketAuthMiddleware). Mọi lỗi connect_error KHÁC (CORS,
			// transport, hạ tầng phía sau...) để mặc kệ Socket.IO tự retry bằng cơ chế backoff có sẵn
			// của chính nó — KHÔNG tự gọi thêm connect() ở đây nữa, vì gọi thêm là nguyên nhân trực
			// tiếp gây ra cơn bão request khi lỗi kéo dài liên tục (xem giải thích bug ở trên).
			if (error.message !== "Unauthorized" || isRecovering) return;

			isRecovering = true;
			queryClient
				.refetchQueries({ queryKey: AUTH_ME_QUERY_KEY })
				.then(() => socket.connect())
				.catch(() => {})
				.finally(() => {
					isRecovering = false;
				});
		};

		socket.on("connect_error", handleConnectError);
		socket.connect();

		return () => {
			socket.off("connect_error", handleConnectError);
			socket.disconnect();
		};
	}, [isAuthenticated, queryClient]);
};
