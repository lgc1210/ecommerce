import apiClient from "../../../../configs/apis";
import type { ListMyNotificationsParams } from "../types";

const notificationService = {
	/** Danh sách thông báo của chính user hiện tại (GET /notifications), có phân trang + lọc. Response kèm sẵn unreadCount, không cần endpoint riêng. */
	getMy: (params: ListMyNotificationsParams = {}) =>
		apiClient.get("/notifications", {
			params: {
				page: params.page,
				limit: params.limit,
				isRead: params.isRead !== undefined ? String(params.isRead) : undefined,
				type: params.type,
			},
		}),
	markAsRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
	markAllAsRead: () => apiClient.patch("/notifications/read-all"),
	remove: (id: number) => apiClient.delete(`/notifications/${id}`),
	/** Xóa toàn bộ thông báo ĐÃ ĐỌC — dọn dẹp hàng loạt, không đụng thông báo chưa đọc. */
	removeAllRead: () => apiClient.delete<{ message: string; deletedCount: number }>("/notifications/read"),
};

export default notificationService;
