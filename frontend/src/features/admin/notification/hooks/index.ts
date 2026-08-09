import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import adminNotificationService from "../services";
import type { BroadcastNotificationPayload } from "../types";
import { getApiErrorMessage } from "../../../../utils/api";

/**
 * Gửi thông báo hệ thống/khuyến mãi tới TOÀN BỘ customer đang hoạt động (không chọn tay từng
 * người — backend tự truy vấn và gửi hàng loạt theo batch, xem notification.service.ts
 * broadcastToAllCustomers). Không cần invalidate query nào ở phía admin — thông báo tạo ra nằm
 * trong danh sách CỦA TỪNG NGƯỜI NHẬN (features/client/notification), không có view "lịch sử đã
 * gửi" ở phía admin (backend chưa cung cấp).
 */
export const useBroadcastNotification = () => {
	return useMutation({
		mutationFn: (payload: BroadcastNotificationPayload) => adminNotificationService.broadcast(payload),
		onSuccess: (res) => {
			toast.success(res.data.message ?? "Đã gửi thông báo.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gửi thông báo thất bại."));
		},
	});
};
