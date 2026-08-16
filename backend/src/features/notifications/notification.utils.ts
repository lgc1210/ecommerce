import type { OrderStatus } from "../../generated/prisma/index.js";
import type { NotificationPayload } from "./notification.validation.js";

/**
 * Nơi tập trung MỌI nội dung thông báo (tiêu đề + nội dung) theo từng sự kiện nghiệp vụ.
 *
 * Đây là các hàm THUẦN (pure function) — không import prisma, không side-effect — nên:
 *  - Test được độc lập, không cần mock DB.
 *  - Muốn thêm 1 loại thông báo mới (vd: "warranty", "chat") chỉ cần thêm 1 hàm build*
 *    tương ứng ở đây + 1 hàm "notify*" mỏng gọi nó trong notification.service.ts, KHÔNG
 *    đụng vào phần persistence/query đã có.
 *  - Đổi văn phong/nội dung thông báo chỉ sửa ở 1 chỗ duy nhất, không rải rác trong các
 *    feature khác (order, payment, review, ...).
 */

const ORDER_STATUS_TEXT: Record<OrderStatus, string> = Object.freeze({
	pending: "đang chờ xử lý",
	processing: "đang được chuẩn bị",
	shipped: "đang được giao",
	delivered: "đã giao thành công",
	cancelled: "đã bị hủy",
} as const);

export function buildOrderPlacedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload {
	return {
		userId,
		type: "order",
		title: "Đặt hàng thành công",
		message: `Đơn hàng ${orderNumber} đã được ghi nhận và đang chờ xử lý.`,
		actionUrl: `/orders/${orderId}`,
		referenceId: String(orderId),
	};
}

export function buildOrderStatusChangedNotification(userId: number, orderId: number, orderNumber: string, status: OrderStatus): NotificationPayload {
	return {
		userId,
		type: "order",
		title: "Cập nhật đơn hàng",
		message: `Đơn hàng ${orderNumber} ${ORDER_STATUS_TEXT[status]}.`,
		actionUrl: `/orders/${orderId}`,
		referenceId: String(orderId),
	};
}

export function buildPaymentCompletedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload {
	return {
		userId,
		type: "payment",
		title: "Thanh toán thành công",
		message: `Đơn hàng ${orderNumber} đã được thanh toán thành công.`,
		actionUrl: `/orders/${orderId}`,
		referenceId: String(orderId),
	};
}

export function buildPaymentFailedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload {
	return {
		userId,
		type: "payment",
		title: "Thanh toán thất bại",
		message: `Thanh toán cho đơn hàng ${orderNumber} không thành công. Vui lòng thử lại.`,
		actionUrl: `/orders/${orderId}`,
		referenceId: String(orderId),
	};
}

export function buildPaymentRefundedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload {
	return {
		userId,
		type: "payment",
		title: "Hoàn tiền thành công",
		message: `Đơn hàng ${orderNumber} đã được hoàn tiền.`,
		actionUrl: `/orders/${orderId}`,
		referenceId: String(orderId),
	};
}
