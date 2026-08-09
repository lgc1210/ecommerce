import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "../../../../components/icons";
import paths from "../../../../configs/constants/paths";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useMarkNotificationAsRead, useMyNotificationsQuery } from "../hooks";
import { NOTIFICATION_TYPE_ICON } from "../constants";
import type { Notification } from "../types";
import { timeAgo } from "../utils";

const RECENT_LIMIT = 5;

/**
 * Icon chuông ở header client — hiển thị badge số thông báo chưa đọc, click mở dropdown xem
 * nhanh 5 thông báo gần nhất. Chỉ hiển thị khi đã đăng nhập (thông báo là dữ liệu cá nhân).
 * Chi tiết đầy đủ + xóa nằm ở tab "Quản lý thông báo" (trang tài khoản) — dropdown này chỉ để
 * xem nhanh, giữ đúng vai trò tương tự UserMenu (xem components/user-menu.tsx).
 */
const NotificationBell = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Dùng chung 1 query cho cả badge số + danh sách 5 thông báo gần nhất — response GET
	// /notifications đã có sẵn field unreadCount, không cần gọi thêm endpoint /unread-count
	// riêng. (Trước đây tách 2 query: query đếm có polling 30s nhưng query danh sách thì
	// không, khiến badge cập nhật còn nội dung dropdown thì bị cũ — lệch nhịp nhau.)
	const { data: listData, isLoading } = useMyNotificationsQuery({ page: 1, limit: RECENT_LIMIT }, { refetchInterval: 30_000 });
	const markAsReadMutation = useMarkNotificationAsRead();

	const unreadCount = listData?.unreadCount ?? 0;
	const notifications = listData?.data ?? [];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!isAuthenticated) return null;

	const handleItemClick = (notification: Notification) => {
		setOpen(false);
		if (!notification.isRead) markAsReadMutation.mutate(notification.id);
		if (notification.actionUrl) navigate(notification.actionUrl);
	};

	const handleViewAll = () => {
		setOpen(false);
		navigate(paths.client.account, { state: { tab: "notifications" } });
	};

	return (
		<div className='relative' ref={menuRef}>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				aria-label='Thông báo'
				className='relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft cursor-default'>
				<BellIcon className='h-5 w-5' />
				{unreadCount > 0 && (
					<span className='absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white'>
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className='absolute right-0 top-[calc(100%+8px)] w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-ink/5'>
					<div className='flex items-center justify-between border-b border-border px-4 py-2.5'>
						<span className='text-sm font-semibold text-ink'>Thông báo</span>
						{unreadCount > 0 && <span className='text-xs text-muted'>{unreadCount} chưa đọc</span>}
					</div>

					<div className='max-h-96 overflow-y-auto'>
						{isLoading && <p className='px-4 py-6 text-center text-sm text-muted'>Đang tải...</p>}

						{!isLoading && notifications.length === 0 && <p className='px-4 py-6 text-center text-sm text-muted'>Bạn chưa có thông báo nào.</p>}

						{notifications.map((notification) => {
							const Icon = NOTIFICATION_TYPE_ICON[notification.type];
							return (
								<button
									key={notification.id}
									type='button'
									onClick={() => handleItemClick(notification)}
									className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-soft hover:not-disabled:cursor-default ${!notification.isRead ? "bg-primary-light/40" : ""}`}>
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
						})}
					</div>

					<button
						type='button'
						onClick={handleViewAll}
						className='block w-full border-t border-border px-4 py-2.5 text-center text-sm font-semibold text-primary-dark hover:bg-primary-light hover:not-disabled:cursor-default'>
						Xem tất cả
					</button>
				</div>
			)}
		</div>
	);
};

export default NotificationBell;
