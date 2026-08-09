/** Chỉ 2 loại admin được phép broadcast — khớp đúng BroadcastNotificationSchema ở backend (order/payment/review/stock là thông báo hệ thống tự sinh, không phải admin gửi tay). */
export type BroadcastNotificationType = "promotion" | "system";

export interface BroadcastNotificationPayload {
	type: BroadcastNotificationType;
	title: string;
	message: string;
	actionUrl?: string;
	imageUrl?: string;
}
