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
	type: NotificationType;
	title: string;
	message: string;
	actionUrl?: string;
	imageUrl?: string;
}

/** Số user xử lý mỗi vòng lặp khi broadcast — vừa đủ nhỏ để 1 câu INSERT không phình to bất thường, vừa đủ lớn để không tốn quá nhiều round-trip DB. */
const BROADCAST_BATCH_SIZE = 500;

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
	// Admin: broadcast thông báo hệ thống/khuyến mãi tới TOÀN BỘ customer đang hoạt động
	// ==========================================
	/**
	 * Gửi 1 thông báo tới mọi user có role "customer" và isActive=true (loại admin/manager/staff
	 * ra — nội bộ không cần nhận thông báo khuyến mãi/hệ thống dành cho khách).
	 *
	 * Xử lý theo BATCH (cursor pagination trên id, đọc + ghi từng lô BROADCAST_BATCH_SIZE user)
	 * thay vì 1 lệnh duy nhất:
	 *  - Không load TOÀN BỘ user vào bộ nhớ cùng lúc (shop có 100k customer vẫn chỉ giữ 500
	 *    bản ghi trong RAM ở bất kỳ thời điểm nào).
	 *  - Không tạo 1 câu INSERT khổng lồ khoá bảng notifications trong thời gian dài — mỗi
	 *    createMany chỉ chứa tối đa 500 dòng, các request khác (đọc/tạo thông báo khác) vẫn
	 *    chen vào xử lý được giữa các batch, tránh nghẽn cả server vì 1 request broadcast.
	 *  - Đây là xử lý ĐỒNG BỘ trong request HTTP (không phải background job) — phù hợp với quy
	 *    mô hiện tại (dự án chưa có hạ tầng queue như BullMQ/Redis, chỉ có node-cron cho tác vụ
	 *    định kỳ). Nếu lượng customer tăng tới mức 1 lần broadcast mất nhiều giây/phút, nên
	 *    chuyển sang xử lý nền (queue + trả response ngay, cập nhật tiến độ riêng) — CHƯA cần
	 *    thiết ở quy mô hiện tại nên không dựng thêm hạ tầng đó bây giờ.
	 */
	async broadcastToAllCustomers(data: BroadcastInput): Promise<{ sentCount: number }> {
		let sentCount = 0;
		let cursorId: number | undefined;

		while (true) {
			const customers = await prisma.user.findMany({
				where: { role: { name: "customer" }, isActive: true },
				select: { id: true },
				orderBy: { id: "asc" },
				take: BROADCAST_BATCH_SIZE,
				...(cursorId !== undefined ? { skip: 1, cursor: { id: cursorId } } : {}),
			});

			if (customers.length === 0) break;

			await this.dispatch(
				customers.map((c) => ({
					userId: c.id,
					type: data.type,
					title: data.title,
					message: data.message,
					actionUrl: data.actionUrl,
					imageUrl: data.imageUrl,
				})),
			);

			sentCount += customers.length;
			cursorId = customers[customers.length - 1]!.id; // an toàn: vòng lặp đã return sớm ở check "customers.length === 0" phía trên nếu rỗng

			if (customers.length < BROADCAST_BATCH_SIZE) break;
		}

		return { sentCount };
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
