import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import type { OrderStatus } from "../../generated/prisma/index.js";
import type { BroadcastNotificationInput, ListOwnNotificationsParams, NotificationPayload } from "./notification.validation.js";
import { activeChannels } from "./channels/channel.registry.js";
import {
	buildOrderPlacedNotification,
	buildOrderStatusChangedNotification,
	buildPaymentCompletedNotification,
	buildPaymentFailedNotification,
	buildPaymentRefundedNotification,
	buildReviewRepliedNotification,
	buildAdminNewOrderContent,
	buildAdminLowStockContent,
	buildAdminPaymentFailedContent,
	buildAdminNewReviewContent,
	buildAdminSystemAlertContent,
	buildAdminNewContactContent,
} from "./notification.utils.js";

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

	async notifyReviewReplied(userId: number, productSlug: string, reviewId: number): Promise<void> {
		await this.dispatch(buildReviewRepliedNotification(userId, productSlug, reviewId));
	}

	// ==========================================
	// Admin: thông báo NỘI BỘ tới staff khi có sự kiện cần theo dõi/xử lý — khác với
	// broadcastToAllCustomers() bên dưới (broadcast tới CUSTOMER). Mỗi sự kiện tạo 1 dòng
	// notification RIÊNG cho từng staff nhận được (dùng chung cơ chế dispatch()/channel như phía
	// customer), không dùng chung 1 dòng cho nhiều người.
	//
	// Người nhận được xác định theo PERMISSION (RBAC đã có sẵn), KHÔNG hardcode role name — xem
	// getUserIdsWithPermission(). Permission chọn cho mỗi sự kiện PHẢI là permission staff-only
	// (không được trùng với bất kỳ permission nào customer cũng có, vd "order:read" — customer
	// dùng permission đó để xem đơn hàng CỦA CHÍNH HỌ), nếu không khách hàng sẽ vô tình nhận được
	// thông báo nội bộ. Xem rbac.seed.ts để biết permission nào đang gán cho role nào.
	//
	// Muốn thêm sự kiện admin mới: thêm 1 hàm buildAdmin*Content ở notification.utils.ts rồi thêm
	// 1 hàm notifyAdmin* mỏng ở đây, gọi notifyAdmins() kèm đúng permission staff-only phù hợp.
	// ==========================================
	/** "Đơn hàng mới" — gọi ngay sau khi checkout() tạo đơn thành công. Nhận: ai có quyền xử lý đơn ("order:update"). */
	async notifyAdminNewOrder(orderId: number, orderNumber: string, totalAmount: number): Promise<void> {
		await this.notifyAdmins(buildAdminNewOrderContent(orderId, orderNumber, totalAmount), { resource: "order", name: "update" });
	}

	/** "Tồn kho thấp" — gọi khi 1 SKU giảm xuống bằng/dưới LOW_STOCK_THRESHOLD. Nhận: ai quản lý kho ("inventory:update"). */
	async notifyAdminLowStock(skuId: number, skuLabel: string, productId: number, productName: string, stockQuantity: number): Promise<void> {
		await this.notifyAdmins(buildAdminLowStockContent(skuId, skuLabel, productId, productName, stockQuantity), { resource: "inventory", name: "update" });
	}

	/** "Thanh toán lỗi" — gọi khi 1 giao dịch chuyển sang trạng thái "failed". Nhận: ai xem được thanh toán ("payment:read"). */
	async notifyAdminPaymentFailed(orderId: number, orderNumber: string): Promise<void> {
		await this.notifyAdmins(buildAdminPaymentFailedContent(orderId, orderNumber), { resource: "payment", name: "read" });
	}

	/** "Khách hàng đánh giá" — gọi ngay sau khi khách tạo 1 đánh giá mới. Nhận: ai kiểm duyệt đánh giá ("review:update"). */
	async notifyAdminNewReview(reviewId: number, productName: string, rating: number): Promise<void> {
		await this.notifyAdmins(buildAdminNewReviewContent(reviewId, productName, rating), { resource: "review", name: "update" });
	}

	/**
	 * "Cảnh báo hệ thống" — dùng cho sự cố kỹ thuật cần admin theo dõi (title/message tự soạn theo
	 * từng nơi gọi). Chưa có permission "system:manage" riêng trong RBAC hiện tại nên tạm dùng
	 * "dashboard:read" — permission tổng quan gần nhất mà chỉ staff mới có. Nếu sau này RBAC có
	 * permission dành riêng cho vận hành hệ thống, nên đổi lại cho đúng ngữ nghĩa hơn.
	 */
	async notifyAdminSystemAlert(title: string, message: string): Promise<void> {
		await this.notifyAdmins(buildAdminSystemAlertContent(title, message), { resource: "dashboard", name: "read" });
	}

	/** "Liên hệ mới" — gọi ngay sau khi có người gửi form liên hệ. Nhận: ai xử lý liên hệ ("contact:manage" — KHÔNG phải "contact:create", đó là quyền của customer). */
	async notifyAdminNewContact(contactId: number, name: string, subject?: string | null): Promise<void> {
		await this.notifyAdmins(buildAdminNewContactContent(contactId, name, subject), { resource: "contact", name: "manage" });
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
	async broadcastToAllCustomers(data: BroadcastNotificationInput): Promise<{ sentCount: number }> {
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
	/**
	 * Điền userId theo từng staff có `permission` truyền vào rồi dispatch() 1 lượt — dùng chung cho
	 * mọi hàm notifyAdmin*() ở trên. Số lượng staff khớp 1 permission trong thực tế rất nhỏ (vài
	 * chục nhân viên là cùng) nên KHÔNG cần xử lý theo batch/cursor như broadcastToAllCustomers()
	 * (dành cho lượng customer có thể lên tới hàng trăm nghìn).
	 */
	private async notifyAdmins(content: Omit<NotificationPayload, "userId">, permission: { resource: string; name: string }): Promise<void> {
		const recipientIds = await this.getUserIdsWithPermission(permission.resource, permission.name);
		if (recipientIds.length === 0) return;

		await this.dispatch(recipientIds.map((userId) => ({ userId, ...content })));
	}

	/**
	 * Tìm mọi user (đang active) mà ROLE của họ được gán permission (resource, name) — tái sử dụng
	 * ĐÚNG hệ thống RBAC hiện có (Role -> RolePermission -> Permission) thay vì hardcode role name
	 * ("admin"/"manager"). Nhờ vậy, sau này thêm role mới (vd "support") và gán cho nó permission
	 * phù hợp thì role đó TỰ ĐỘNG nhận đúng loại thông báo tương ứng — không cần sửa file này.
	 *
	 * LƯU Ý: permission truyền vào PHẢI là permission staff-only (không được customer cũng có, vd
	 * "order:read") — xem comment ở từng hàm notifyAdmin* phía trên để biết vì sao chọn permission đó.
	 */
	private async getUserIdsWithPermission(resource: string, name: string): Promise<number[]> {
		const users = await prisma.user.findMany({
			where: {
				isActive: true,
				role: { permissions: { some: { permission: { resource, name } } } },
			},
			select: { id: true },
		});
		return users.map((u) => u.id);
	}

	private async getOwnNotificationOrThrow(userId: number, id: number) {
		const notification = await prisma.notification.findUnique({ where: { id } });
		if (!notification || notification.userId !== userId) {
			throw new Error("NotFound: Thông báo không tồn tại.");
		}
		return notification;
	}
}

export default new NotificationService();
