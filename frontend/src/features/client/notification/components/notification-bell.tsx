import { useNavigate } from "react-router-dom";
import { BellIcon } from "../../../../components/icons";
import Button from "../../../../components/button";
import paths from "../../../../configs/constants/paths";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useMarkNotificationAsRead, useMyNotificationsQuery } from "../hooks";
import { NOTIFICATION_TYPE_ICON } from "../constants";
import { resolveNotificationLink, timeAgo } from "../utils";
import type { Notification } from "../types";
import HoverPreview from "../../../../shared/components/hover-preview";

const RECENT_LIMIT = 5;

const NotificationBell = () => {
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
			const { to, state } = resolveNotificationLink(notification.actionUrl);
			navigate(to, state ? { state, viewTransition: true } : undefined);
		}
	};

	const handleViewAll = () => {
		navigate(paths.client.account, {
			state: { tab: "notifications" },
			viewTransition: true,
		});
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
				})}
			</div>

			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={handleViewAll}
				className='w-full rounded-none! border-t border-border font-semibold text-primary-dark hover:bg-primary-light hover:not-disabled:cursor-default'>
				Xem tất cả
			</Button>
		</HoverPreview>
	);
};

export default NotificationBell;
