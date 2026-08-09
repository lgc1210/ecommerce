import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import type { NotificationType, OrderStatus } from "../../generated/prisma/index.js";
import type { NotificationPayload } from "./notification.validation.js";
import { activeChannels } from "./channels/channel.registry.js";
import {
	buildOrderPlacedNotification,
	buildOrderStatusChangedNotification,
	buildPaymentCompletedNotification,
	buildPaymentFailedNotification,
	buildPaymentRefundedNotification,
} from "./notification.utils.js";

interface ListOwnNotificationsParams {
	page?: string;
	limit?: string;
	isRead?: string;
	type?: string;
}

interface BroadcastInput {
	userIds: number[];
	type: NotificationType;
	title: string;
	message: string;
	actionUrl?: string;
	imageUrl?: string;
}

class NotificationService {
	// ==========================================
	// Customer (self-service)
	// ==========================================
	async listOwn(userId: number, params: ListOwnNotificationsParams) {
		const where: Record<string, unknown> = { userId };
		if (params.isRead !== undefined) where.isRead = params.isRead === "true";
		if (params.type) where.type = params.type;

		const { page, limit, skip } = parsePagination(params);
		const [data, total, unreadCount] = await Promise.all([
			prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
			prisma.notification.count({ where }),
			prisma.notification.count({ where: { userId, isRead: false } }),
		]);

		return {
			data,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
			unreadCount,
		};
	}

	async markAsRead(userId: number, id: number) {
		const notification = await this.getOwnNotificationOrThrow(userId, id);
		if (notification.isRead) return notification;

		return prisma.notification.update({
			where: { id },
			data: { isRead: true, readAt: new Date() },
		});
	}

	async markAllAsRead(userId: number) {
		await prisma.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true, readAt: new Date() },
		});
	}

	async deleteOwn(userId: number, id: number) {
		await this.getOwnNotificationOrThrow(userId, id);
		await prisma.notification.delete({ where: { id } });
	}

	/** Xóa toàn bộ thông báo ĐÃ ĐỌC của user — dọn dẹp hàng loạt, không đụng tới thông báo chưa đọc. */
	async deleteAllRead(userId: number): Promise<{ deletedCount: number }> {
		const { count } = await prisma.notification.deleteMany({ where: { userId, isRead: true } });
		return { deletedCount: count };
	}

	// ==========================================
	// Internal API — được các feature khác (order, payment, review, ...) gọi để bắn thông báo.
	// dispatch() gửi qua TẤT CẢ kênh trong channel.registry.ts (hiện chỉ có in-app/DB). Mỗi
	// kênh tự bọc try/catch RIÊNG — 1 kênh lỗi (vd sau này thêm email mà SMTP sập) không được
	// kéo theo kênh khác hỏng theo, và CHƯA BAO GIỜ được phép làm fail luồng nghiệp vụ chính
	// (đặt hàng, thanh toán, ...) đang gọi tới nó. Tương tự cách createShipmentAfterPayment lỗi
	// cũng chỉ log chứ không rollback thanh toán.
	// ==========================================
	async dispatch(payload: NotificationPayload | NotificationPayload[]): Promise<void> {
		const payloads = Array.isArray(payload) ? payload : [payload];
		if (payloads.length === 0) return;

		await Promise.all(
			activeChannels.map(async (channel) => {
				try {
					await channel.send(payloads);
				} catch (error) {
					console.error(`[notification] Kênh "${channel.name}" gửi thông báo thất bại:`, error);
				}
			}),
		);
	}

	/** Muốn thêm sự kiện thông báo mới: thêm 1 hàm build* ở notification.utils.ts rồi thêm 1 hàm notify* mỏng ở đây, gọi dispatch(). */
	async notifyOrderPlaced(userId: number, orderId: number, orderNumber: string): Promise<void> {
		await this.dispatch(buildOrderPlacedNotification(userId, orderId, orderNumber));
	}

	async notifyOrderStatusChanged(userId: number, orderId: number, orderNumber: string, status: OrderStatus): Promise<void> {
		await this.dispatch(buildOrderStatusChangedNotification(userId, orderId, orderNumber, status));
	}

	async notifyPaymentCompleted(userId: number, orderId: number, orderNumber: string): Promise<void> {
		await this.dispatch(buildPaymentCompletedNotification(userId, orderId, orderNumber));
	}

	async notifyPaymentFailed(userId: number, orderId: number, orderNumber: string): Promise<void> {
		await this.dispatch(buildPaymentFailedNotification(userId, orderId, orderNumber));
	}

	async notifyPaymentRefunded(userId: number, orderId: number, orderNumber: string): Promise<void> {
		await this.dispatch(buildPaymentRefundedNotification(userId, orderId, orderNumber));
	}

	// ==========================================
	// Admin: broadcast thông báo hệ thống/khuyến mãi tới nhiều user cùng lúc
	// ==========================================
	async broadcast(data: BroadcastInput): Promise<void> {
		const payloads: NotificationPayload[] = data.userIds.map((userId) => ({
			userId,
			type: data.type,
			title: data.title,
			message: data.message,
			actionUrl: data.actionUrl,
			imageUrl: data.imageUrl,
		}));

		await this.dispatch(payloads);
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async getOwnNotificationOrThrow(userId: number, id: number) {
		const notification = await prisma.notification.findUnique({ where: { id } });
		if (!notification || notification.userId !== userId) {
			throw new Error("NotFound: Thông báo không tồn tại.");
		}
		return notification;
	}
}

export default new NotificationService();
