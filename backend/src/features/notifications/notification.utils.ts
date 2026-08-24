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

/** actionUrl phải khớp route thật của FE là "/product/:slug" (số ít, dùng slug) — xem paths.client.productDetail. */
export function buildReviewRepliedNotification(userId: number, productSlug: string, reviewId: number): NotificationPayload {
	return {
		userId,
		type: "review",
		title: "Shop đã phản hồi đánh giá của bạn",
		message: "Đánh giá của bạn vừa nhận được phản hồi từ shop. Xem ngay nhé!",
		actionUrl: `/product/${productSlug}#review-${reviewId}`,
		referenceId: String(reviewId),
	};
}

/**
 * ==========================================
 * Nội dung thông báo gửi cho ADMIN/MANAGER (không phải customer).
 * ==========================================
 * Các hàm dưới đây KHÔNG nhận userId — vì 1 sự kiện admin cần bắn tới NHIỀU user cùng lúc
 * (mọi admin/manager đang active), không phải 1 người như phía customer. Phần điền userId theo
 * từng admin nằm ở notification.service.ts (xem notifyAdmins()), builder ở đây chỉ tạo phần
 * NỘI DUNG dùng chung cho tất cả admin nhận được.
 */
type AdminNotificationContent = Omit<NotificationPayload, "userId">;

/**
 * "Đơn hàng mới" — bắn ngay sau khi khách đặt hàng thành công (xem order.service.ts -> checkout).
 * actionUrl trỏ THẲNG tới URL thật của trang "/admin/order" kèm query "search" — trang này đã
 * đồng bộ 2 chiều với URL (xem useListQueryParams ở pages/admin/order/index.tsx), search theo
 * orderNumber (unique) nên luôn ra ĐÚNG 1 kết quả. KHÔNG dùng path kiểu "/admin/orders/:id" vì
 * frontend không có route chi tiết riêng cho order — chi tiết mở qua modal + state cục bộ ngay
 * trong trang list (xem order-detail-modal.tsx).
 */
export function buildAdminNewOrderContent(orderId: number, orderNumber: string, totalAmount: number): AdminNotificationContent {
	return {
		type: "order",
		title: "Đơn hàng mới",
		message: `Đơn hàng ${orderNumber} vừa được đặt, giá trị ${totalAmount.toLocaleString("vi-VN")}đ.`,
		actionUrl: `/admin/order?search=${encodeURIComponent(orderNumber)}`,
		referenceId: String(orderId),
	};
}

/**
 * "Tồn kho thấp" — bắn khi 1 SKU giảm xuống bằng/dưới LOW_STOCK_THRESHOLD (xem order.service.ts ->
 * checkout). actionUrl trỏ THẲNG tới route thật "/admin/product/:id" (trang chi tiết sản phẩm,
 * nơi duy nhất quản lý tồn kho từng SKU — xem pages/admin/product/detail.tsx), dùng productId chứ
 * KHÔNG phải skuId vì route chỉ có param cấp sản phẩm.
 */
export function buildAdminLowStockContent(skuId: number, skuLabel: string, productId: number, productName: string, stockQuantity: number): AdminNotificationContent {
	return {
		type: "stock",
		title: "Tồn kho thấp",
		message: `Sản phẩm "${productName}" (SKU: ${skuLabel}) chỉ còn ${stockQuantity} trong kho.`,
		actionUrl: `/admin/product/${productId}`,
		referenceId: String(skuId),
	};
}

/** "Thanh toán lỗi" — bắn khi 1 giao dịch chuyển sang "failed" (IPN gateway hoặc staff cập nhật thủ công). Cùng cơ chế search-by-orderNumber như "Đơn hàng mới" ở trên, áp dụng cho trang "/admin/payment". */
export function buildAdminPaymentFailedContent(orderId: number, orderNumber: string): AdminNotificationContent {
	return {
		type: "payment",
		title: "Thanh toán lỗi",
		message: `Giao dịch thanh toán cho đơn hàng ${orderNumber} vừa thất bại.`,
		actionUrl: `/admin/payment?search=${encodeURIComponent(orderNumber)}`,
		referenceId: String(orderId),
	};
}

/**
 * "Khách hàng đánh giá" — bắn khi khách vừa tạo 1 đánh giá mới (xem review.service.ts ->
 * createReview). KHÔNG kèm query search: trang Review chỉ search theo NỘI DUNG nhận xét (xem
 * review.service.ts -> where.comment), không search được theo tên sản phẩm — nên dẫn thẳng về
 * "/admin/review" (không filter) là đủ, vì danh sách mặc định sort theo createdAt desc, review
 * vừa tạo luôn nằm ở đầu trang 1.
 */
export function buildAdminNewReviewContent(reviewId: number, productName: string, rating: number): AdminNotificationContent {
	return {
		type: "review",
		title: "Khách hàng đánh giá",
		message: `Sản phẩm "${productName}" vừa nhận đánh giá ${rating}/5 sao từ khách hàng.`,
		actionUrl: `/admin/review`,
		referenceId: String(reviewId),
	};
}

/**
 * "Cảnh báo hệ thống" — dùng cho các sự cố kỹ thuật cần admin theo dõi/xử lý thủ công (vd: tạo
 * vận đơn GHN thất bại sau khi đã thu tiền, cron job dọn đơn quá hạn gặp lỗi, ...). title/message
 * do nơi gọi tự soạn theo từng sự cố cụ thể, KHÔNG cố định như các loại khác ở trên. Không có
 * actionUrl: không có 1 trang đích chung nào phù hợp cho mọi loại sự cố kỹ thuật khác nhau — FE
 * hiển thị dạng không click được (xem admin notification-bell).
 */
export function buildAdminSystemAlertContent(title: string, message: string): AdminNotificationContent {
	return { type: "system", title, message };
}

/** "Liên hệ mới" — bắn khi có người gửi form liên hệ (kể cả khách chưa đăng nhập). Trang Contact search theo tên/email/chủ đề (xem contact.service.ts), nên search theo `name` là đủ để lọc ra liên hệ vừa gửi. */
export function buildAdminNewContactContent(contactId: number, name: string, subject?: string | null): AdminNotificationContent {
	return {
		type: "contact",
		title: "Liên hệ mới",
		message: subject ? `${name} vừa gửi liên hệ: "${subject}".` : `${name} vừa gửi 1 liên hệ mới.`,
		actionUrl: `/admin/contact?search=${encodeURIComponent(name)}`,
		referenceId: String(contactId),
	};
}
