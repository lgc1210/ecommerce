import { Link, useNavigate } from "react-router-dom";
import { BellIcon } from "../../../../../components/icons";
import { useAuth } from "../../../../auth/hooks/useAuth";
import { useMarkNotificationAsRead, useMyNotificationsQuery } from "../../../../client/notification/hooks";
import { timeAgo } from "../../../../client/notification/utils";
import type { Notification } from "../../../../client/notification/types";
import HoverPreview from "../../../../../shared/components/hover-preview";
import NotificationBellSkeleton from "../../../../client/header/components/notification-bell/skeleton";
import { NOTIFICATION_TYPE_ICON } from "../../../../../shared/constants/notification";
import paths from "../../../../../configs/constants/paths";

const RECENT_LIMIT = 5;

/**
 * Dropdown chuông thông báo ở header admin — thông báo NỘI BỘ (đơn hàng mới, tồn kho thấp, thanh
 * toán lỗi, khách hàng đánh giá, cảnh báo hệ thống, liên hệ mới), KHÁC với thông báo của customer.
 *
 * CHỦ Ý tái sử dụng thẳng service/hook/types/constants ở features/client/notification thay vì
 * tạo bản sao riêng cho admin: về bản chất đây là CÙNG 1 endpoint self-service (GET /notifications)
 * — backend không phân biệt "notification của customer" hay "của admin" như 2 tài nguyên khác
 * nhau, mà chỉ trả về thông báo CỦA CHÍNH user đang đăng nhập (xem notification.service.ts ->
 * getUserIdsWithPermission/dispatch). Admin/manager cũng là 1 User bình thường, nên tái dùng
 * nguyên vẹn là đúng, tránh trùng lặp code không cần thiết.
 *
 * KHÁC với NotificationBell bên client (features/client/header/components/notification-bell):
 * không cần resolveNotificationLink() để "dịch" actionUrl — actionUrl backend trả cho thông báo
 * admin đã là URL THẬT trên frontend (vd "/admin/order?search=DH123", "/admin/product/45"), có
 * thể navigate() thẳng. Xem comment ở notification.utils.ts (backend) để biết vì sao — các trang
 * admin dùng modal + state cục bộ hoặc query string thay vì route chi tiết riêng.
 *
 * Cũng KHÔNG có link "Xem tất cả": admin hiện chưa có trang "quản lý thông báo" riêng như tab
 * "notifications" bên /account của customer (trang /admin/notification hiện tại là trang GỬI
 * thông báo hàng loạt, không phải trang XEM thông báo nhận được) — dropdown 5 thông báo gần nhất
 * là điểm truy cập duy nhất cho tới khi có trang đó.
 */
const AdminNotificationBell = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const { data: listData, isLoading } = useMyNotificationsQuery({ page: 1, limit: RECENT_LIMIT }, { refetchInterval: 30_000 });
	const markAsReadMutation = useMarkNotificationAsRead();

	const unreadCount = listData?.unreadCount ?? 0;
	const notifications = listData?.data ?? [];

	if (!isAuthenticated) return null;

	const handleItemClick = (notification: Notification) => {
		if (!notification.isRead) {
			markAsReadMutation.mutate(notification.id);
		}
		if (notification.actionUrl) {
			// state.fromNotification để trang đích (order/payment/review/contact) biết mà TỰ ĐỘNG mở
			// modal chi tiết khi kết quả lọc theo query "search" chỉ ra đúng 1 dòng — xem
			// pages/admin/order/index.tsx (và payment/review/contact tương tự). Cờ này rất quan trọng:
			// nếu không có nó, hành vi "tự mở modal khi còn 1 kết quả" sẽ áp dụng luôn cho cả lúc admin
			// tự gõ tìm kiếm thủ công, gây bất ngờ khó chịu.
			navigate(notification.actionUrl, { state: { fromNotification: true } });
		}
	};

	return (
		<HoverPreview
			trigger={
				<button type='button' aria-label='Thông báo' aria-haspopup='dialog' className='relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft cursor-default'>
					<BellIcon className='h-5 w-5' />
					{unreadCount > 0 && (
						<span className='absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white'>
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</button>
			}>
			<div className='flex items-center justify-between border-b border-border px-4 py-2.5'>
				<span className='text-sm font-semibold text-ink'>Thông báo gần đây</span>
				{unreadCount > 0 && <span className='text-xs text-muted'>{unreadCount} chưa đọc</span>}
			</div>

			<div className='max-h-96 overflow-y-auto'>
				{isLoading ? (
					<NotificationBellSkeleton />
				) : !isLoading && notifications.length === 0 ? (
					<p className='px-4 py-6 text-center text-sm text-muted'>Chưa có thông báo nào.</p>
				) : (
					notifications.map((notification) => {
						const Icon = NOTIFICATION_TYPE_ICON[notification.type];

						return (
							<button
								key={notification.id}
								type='button'
								onClick={() => handleItemClick(notification)}
								className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-soft hover:not-disabled:cursor-default ${
									!notification.isRead ? "bg-primary-light/40" : ""
								}`}>
								<span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink/70'>
									<Icon className='h-4 w-4' />
								</span>

								<span className='min-w-0 flex-1'>
									<span className='block truncate text-sm font-semibold text-ink'>{notification.title}</span>
									<span className='mt-0.5 block line-clamp-2 text-xs text-muted'>{notification.message}</span>
									<span className='mt-1 block text-[11px] text-muted'>{timeAgo(notification.createdAt)}</span>
								</span>

								{!notification.isRead && <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary' />}
							</button>
						);
					})
				)}
			</div>

			{!isLoading && (
				<Link to={paths.admin.notification} className='block text-center py-2 text-sm w-full border-t border-border font-semibold text-primary-dark hover:bg-primary-light cursor-default'>
					Xem tất cả
				</Link>
			)}
		</HoverPreview>
	);
};

export default AdminNotificationBell;
