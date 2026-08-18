import type { NOTIFICATION_TYPE } from "../../../../shared/constants/notification";
import type { Pagination } from "../../../../types";

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** 1 thông báo của user hiện tại (GET /notifications). */
export interface Notification {
	id: number;
	userId: number;
	type: NotificationType;
	title: string;
	message: string;
	isRead: boolean;
	actionUrl: string | null;
	referenceId: string | null;
	imageUrl: string | null;
	createdAt: string;
	readAt: string | null;
}

export interface ListMyNotificationsParams {
	page?: number;
	limit?: number;
	isRead?: boolean;
	type?: NotificationType;
}

export interface ListMyNotificationsResult {
	data: Notification[];
	pagination: Pagination;
	/** Backend trả kèm luôn trong response danh sách, không cần gọi thêm request riêng để hiển thị badge. */
	unreadCount: number;
}
