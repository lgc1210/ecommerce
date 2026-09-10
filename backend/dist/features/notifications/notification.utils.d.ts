import type { OrderStatus } from "../../generated/prisma/index.js";
import type { NotificationPayload } from "./notification.validation.js";
export declare function buildOrderPlacedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload;
export declare function buildOrderStatusChangedNotification(userId: number, orderId: number, orderNumber: string, status: OrderStatus): NotificationPayload;
export declare function buildPaymentCompletedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload;
export declare function buildPaymentFailedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload;
export declare function buildPaymentRefundedNotification(userId: number, orderId: number, orderNumber: string): NotificationPayload;
/** actionUrl phải khớp route thật của FE là "/product/:slug" (số ít, dùng slug) — xem paths.client.productDetail. */
export declare function buildReviewRepliedNotification(userId: number, productSlug: string, reviewId: number): NotificationPayload;
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
export declare function buildAdminNewOrderContent(orderId: number, orderNumber: string, totalAmount: number): AdminNotificationContent;
/**
 * "Tồn kho thấp" — bắn khi 1 SKU giảm xuống bằng/dưới LOW_STOCK_THRESHOLD (xem order.service.ts ->
 * checkout). actionUrl trỏ THẲNG tới route thật "/admin/product/:id" (trang chi tiết sản phẩm,
 * nơi duy nhất quản lý tồn kho từng SKU — xem pages/admin/product/detail.tsx), dùng productId chứ
 * KHÔNG phải skuId vì route chỉ có param cấp sản phẩm.
 */
export declare function buildAdminLowStockContent(skuId: number, skuLabel: string, productId: number, productName: string, stockQuantity: number): AdminNotificationContent;
/** "Thanh toán lỗi" — bắn khi 1 giao dịch chuyển sang "failed" (IPN gateway hoặc staff cập nhật thủ công). Cùng cơ chế search-by-orderNumber như "Đơn hàng mới" ở trên, áp dụng cho trang "/admin/payment". */
export declare function buildAdminPaymentFailedContent(orderId: number, orderNumber: string): AdminNotificationContent;
/**
 * "Khách hàng đánh giá" — bắn khi khách vừa tạo 1 đánh giá mới (xem review.service.ts ->
 * createReview). KHÔNG kèm query search: trang Review chỉ search theo NỘI DUNG nhận xét (xem
 * review.service.ts -> where.comment), không search được theo tên sản phẩm — nên dẫn thẳng về
 * "/admin/review" (không filter) là đủ, vì danh sách mặc định sort theo createdAt desc, review
 * vừa tạo luôn nằm ở đầu trang 1.
 */
export declare function buildAdminNewReviewContent(reviewId: number, productName: string, rating: number): AdminNotificationContent;
/**
 * "Cảnh báo hệ thống" — dùng cho các sự cố kỹ thuật cần admin theo dõi/xử lý thủ công (vd: tạo
 * vận đơn GHN thất bại sau khi đã thu tiền, cron job dọn đơn quá hạn gặp lỗi, ...). title/message
 * do nơi gọi tự soạn theo từng sự cố cụ thể, KHÔNG cố định như các loại khác ở trên. Không có
 * actionUrl: không có 1 trang đích chung nào phù hợp cho mọi loại sự cố kỹ thuật khác nhau — FE
 * hiển thị dạng không click được (xem admin notification-bell).
 */
export declare function buildAdminSystemAlertContent(title: string, message: string): AdminNotificationContent;
/** "Liên hệ mới" — bắn khi có người gửi form liên hệ (kể cả khách chưa đăng nhập). Trang Contact search theo tên/email/chủ đề (xem contact.service.ts), nên search theo `name` là đủ để lọc ra liên hệ vừa gửi. */
export declare function buildAdminNewContactContent(contactId: number, name: string, subject?: string | null): AdminNotificationContent;
export {};
//# sourceMappingURL=notification.utils.d.ts.map