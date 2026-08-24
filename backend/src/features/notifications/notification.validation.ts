import { z } from "zod";
import { numericIdString } from "../../shared/validation.js";
import { NotificationType } from "../../generated/prisma/index.js";

// ==========================================
// Payload nội bộ — dùng bởi notification.utils.ts (build*) và notification.service.ts (dispatch).
// Định nghĩa DUY NHẤT tại đây, NotificationPayload (type) suy ra bằng z.infer để tránh lặp lại
// interface thủ công song song với schema.
// ==========================================
export const NotificationPayloadSchema = z.object({
	userId: z.number().int().positive(),
	type: z.enum([NotificationType.order, NotificationType.payment, NotificationType.promotion, NotificationType.stock, NotificationType.system, NotificationType.review, NotificationType.contact]),
	title: z.string().min(1).max(255),
	message: z.string().min(1),
	actionUrl: z.string().max(255).optional(),
	referenceId: z.string().max(50).optional(),
	imageUrl: z.string().max(255).optional(),
});

// ==========================================
// Customer (self-service)
// ==========================================
export const ListOwnNotificationsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		isRead: z.enum(["true", "false"]).optional(),
		type: z
			.enum([NotificationType.order, NotificationType.payment, NotificationType.promotion, NotificationType.stock, NotificationType.system, NotificationType.review, NotificationType.contact])
			.optional(),
	}),
});

export const NotificationIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

// ==========================================
// Admin: broadcast thông báo hệ thống/khuyến mãi tới TOÀN BỘ customer đang hoạt động
// (không nhận danh sách userIds — xem notification.service.ts broadcastToAllCustomers)
// ==========================================
export const BroadcastNotificationSchema = z.object({
	body: z.object({
		type: z.enum([NotificationType.promotion, NotificationType.system], { message: "Chỉ hỗ trợ broadcast loại 'promotion' hoặc 'system'." }),
		title: z.string().min(1).max(255),
		message: z.string().min(1),
		actionUrl: z.string().max(255).optional(),
		imageUrl: z.string().max(255).optional(),
	}),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type BroadcastNotificationInput = z.infer<typeof BroadcastNotificationSchema>["body"];
export type ListOwnNotificationsParams = z.infer<typeof ListOwnNotificationsQuerySchema>["query"];
