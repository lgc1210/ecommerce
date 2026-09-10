import type { OrderStatus } from "../../generated/prisma/index.js";
import type { BroadcastNotificationInput, ListOwnNotificationsParams, NotificationPayload } from "./notification.validation.js";
declare class NotificationService {
    listOwn(userId: number, params: ListOwnNotificationsParams): Promise<{
        data: {
            type: import("../../generated/prisma/index.js").$Enums.NotificationType;
            message: string;
            id: number;
            userId: number;
            createdAt: Date | null;
            imageUrl: string | null;
            title: string;
            isRead: boolean;
            actionUrl: string | null;
            referenceId: string | null;
            readAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        unreadCount: number;
    }>;
    markAsRead(userId: number, id: number): Promise<{
        type: import("../../generated/prisma/index.js").$Enums.NotificationType;
        message: string;
        id: number;
        userId: number;
        createdAt: Date | null;
        imageUrl: string | null;
        title: string;
        isRead: boolean;
        actionUrl: string | null;
        referenceId: string | null;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: number): Promise<void>;
    deleteOwn(userId: number, id: number): Promise<void>;
    /** Xóa toàn bộ thông báo ĐÃ ĐỌC của user — dọn dẹp hàng loạt, không đụng tới thông báo chưa đọc. */
    deleteAllRead(userId: number): Promise<{
        deletedCount: number;
    }>;
    dispatch(payload: NotificationPayload | NotificationPayload[]): Promise<void>;
    /** Muốn thêm sự kiện thông báo mới: thêm 1 hàm build* ở notification.utils.ts rồi thêm 1 hàm notify* mỏng ở đây, gọi dispatch(). */
    notifyOrderPlaced(userId: number, orderId: number, orderNumber: string): Promise<void>;
    notifyOrderStatusChanged(userId: number, orderId: number, orderNumber: string, status: OrderStatus): Promise<void>;
    notifyPaymentCompleted(userId: number, orderId: number, orderNumber: string): Promise<void>;
    notifyPaymentFailed(userId: number, orderId: number, orderNumber: string): Promise<void>;
    notifyPaymentRefunded(userId: number, orderId: number, orderNumber: string): Promise<void>;
    notifyReviewReplied(userId: number, productSlug: string, reviewId: number): Promise<void>;
    /** "Đơn hàng mới" — gọi ngay sau khi checkout() tạo đơn thành công. Nhận: ai có quyền xử lý đơn ("order:update"). */
    notifyAdminNewOrder(orderId: number, orderNumber: string, totalAmount: number): Promise<void>;
    /** "Tồn kho thấp" — gọi khi 1 SKU giảm xuống bằng/dưới LOW_STOCK_THRESHOLD. Nhận: ai quản lý kho ("inventory:update"). */
    notifyAdminLowStock(skuId: number, skuLabel: string, productId: number, productName: string, stockQuantity: number): Promise<void>;
    /** "Thanh toán lỗi" — gọi khi 1 giao dịch chuyển sang trạng thái "failed". Nhận: ai xem được thanh toán ("payment:read"). */
    notifyAdminPaymentFailed(orderId: number, orderNumber: string): Promise<void>;
    /** "Khách hàng đánh giá" — gọi ngay sau khi khách tạo 1 đánh giá mới. Nhận: ai kiểm duyệt đánh giá ("review:update"). */
    notifyAdminNewReview(reviewId: number, productName: string, rating: number): Promise<void>;
    /**
     * "Cảnh báo hệ thống" — dùng cho sự cố kỹ thuật cần admin theo dõi (title/message tự soạn theo
     * từng nơi gọi). Chưa có permission "system:manage" riêng trong RBAC hiện tại nên tạm dùng
     * "dashboard:read" — permission tổng quan gần nhất mà chỉ staff mới có. Nếu sau này RBAC có
     * permission dành riêng cho vận hành hệ thống, nên đổi lại cho đúng ngữ nghĩa hơn.
     */
    notifyAdminSystemAlert(title: string, message: string): Promise<void>;
    /** "Liên hệ mới" — gọi ngay sau khi có người gửi form liên hệ. Nhận: ai xử lý liên hệ ("contact:manage" — KHÔNG phải "contact:create", đó là quyền của customer). */
    notifyAdminNewContact(contactId: number, name: string, subject?: string | null): Promise<void>;
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
    broadcastToAllCustomers(data: BroadcastNotificationInput): Promise<{
        sentCount: number;
    }>;
    /**
     * Điền userId theo từng staff có `permission` truyền vào rồi dispatch() 1 lượt — dùng chung cho
     * mọi hàm notifyAdmin*() ở trên. Số lượng staff khớp 1 permission trong thực tế rất nhỏ (vài
     * chục nhân viên là cùng) nên KHÔNG cần xử lý theo batch/cursor như broadcastToAllCustomers()
     * (dành cho lượng customer có thể lên tới hàng trăm nghìn).
     */
    private notifyAdmins;
    /**
     * Tìm mọi user (đang active) mà ROLE của họ được gán permission (resource, name) — tái sử dụng
     * ĐÚNG hệ thống RBAC hiện có (Role -> RolePermission -> Permission) thay vì hardcode role name
     * ("admin"/"manager"). Nhờ vậy, sau này thêm role mới (vd "support") và gán cho nó permission
     * phù hợp thì role đó TỰ ĐỘNG nhận đúng loại thông báo tương ứng — không cần sửa file này.
     *
     * LƯU Ý: permission truyền vào PHẢI là permission staff-only (không được customer cũng có, vd
     * "order:read") — xem comment ở từng hàm notifyAdmin* phía trên để biết vì sao chọn permission đó.
     */
    private getUserIdsWithPermission;
    private getOwnNotificationOrThrow;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map