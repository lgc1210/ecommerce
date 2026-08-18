import type { BROADCAST_NOTIFICATION_TYPE } from "../../../../shared/constants/notification";

/** Chỉ 2 loại admin được phép broadcast — khớp đúng BroadcastNotificationSchema ở backend (order/payment/review/stock là thông báo hệ thống tự sinh, không phải admin gửi tay). */
export type BroadcastNotificationType = (typeof BROADCAST_NOTIFICATION_TYPE)[keyof typeof BROADCAST_NOTIFICATION_TYPE];

export interface BroadcastNotificationPayload {
	type: BroadcastNotificationType;
	title: string;
	message: string;
	actionUrl?: string;
	imageUrl?: string;
}
