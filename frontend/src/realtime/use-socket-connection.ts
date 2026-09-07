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

		socket.connect();

		const handleConnectError = () => {
			queryClient
				.refetchQueries({ queryKey: AUTH_ME_QUERY_KEY })
				.then(() => socket.connect())
				.catch(() => {
					// refetch /auth/me thất bại hẳn (refresh token cũng hết hạn) -> phiên đăng nhập
					// thật sự đã hết, không cố connect lại nữa.
				});
		};

		socket.on("connect_error", handleConnectError);

		return () => {
			socket.off("connect_error", handleConnectError);
		};
	}, [isAuthenticated, queryClient]);
};
