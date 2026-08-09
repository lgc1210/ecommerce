import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellIcon, CheckIcon, TrashIcon } from "../../../../../components/icons";
import Pagination from "../../../../../components/pagination";
import Button from "../../../../../components/button";
import Popup from "../../../../../components/popup";
import { formatDate } from "../../../../../utils";
import { useDeleteAllReadNotifications, useDeleteNotification, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useMyNotificationsQuery } from "../../../notification/hooks";
import { NOTIFICATION_TYPE_ICON, NOTIFICATION_TYPE_LABEL } from "../../../notification/constants";
import { resolveNotificationLink } from "../../../notification/utils";

const PAGE_SIZE = 10;

/**
 * Tab "Quản lý thông báo" trong trang tài khoản — dùng GET /notifications (self-service, chỉ
 * cần đăng nhập). Khác với dropdown chuông ở header (chỉ xem nhanh 5 thông báo gần nhất, không
 * xóa được), tab này là nơi quản lý đầy đủ: đánh dấu đã đọc từng cái/tất cả, xóa từng cái, và
 * xóa hàng loạt toàn bộ thông báo đã đọc.
 */
const NotificationsTab = () => {
	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || PAGE_SIZE;

	const { data, isLoading } = useMyNotificationsQuery({ page, limit });
	const markAsReadMutation = useMarkNotificationAsRead();
	const markAllAsReadMutation = useMarkAllNotificationsAsRead();
	const deleteMutation = useDeleteNotification();
	const deleteAllReadMutation = useDeleteAllReadNotifications();
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [confirmingDeleteAllRead, setConfirmingDeleteAllRead] = useState(false);

	const notifications = data?.data ?? [];
	const unreadCount = data?.unreadCount ?? 0;
	// Tổng số đã đọc suy ra từ total - unreadCount (tính trên TOÀN BỘ thông báo, không chỉ trang
	// hiện tại) — không cần thêm field riêng từ backend vì response đã có sẵn 2 con số này.
	const readCount = data ? data.pagination.total - unreadCount : 0;

	const handleDelete = (id: number) => {
		setDeletingId(id);
		deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
	};

	if (isLoading) {
		return <p className='py-8 text-center text-sm text-muted'>Đang tải...</p>;
	}

	if (notifications.length === 0) {
		return (
			<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
				<BellIcon className='mx-auto mb-2 h-6 w-6 text-muted' />
				Bạn chưa có thông báo nào.
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{(unreadCount > 0 || readCount > 0) && (
				<div className='flex flex-wrap justify-end gap-2'>
					{unreadCount > 0 && (
						<Button variant='outline' size='sm' icon={<CheckIcon className='h-4 w-4' />} iconPosition='left' onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending}>
							Đánh dấu tất cả đã đọc
						</Button>
					)}
					{readCount > 0 && (
						<Button
							variant='outline'
							size='sm'
							icon={<TrashIcon className='h-4 w-4' />}
							iconPosition='left'
							className='border-red-200! text-red-600! hover:border-red-400! hover:text-red-700!'
							onClick={() => setConfirmingDeleteAllRead(true)}>
							Xóa thông báo đã đọc
						</Button>
					)}
				</div>
			)}

			<div className='space-y-3'>
				{notifications.map((notification) => {
					const Icon = NOTIFICATION_TYPE_ICON[notification.type];
					return (
						<div key={notification.id} className={`flex items-start gap-3 rounded-2xl border p-5 ${notification.isRead ? "border-border bg-surface" : "border-primary-light bg-primary-light/30"}`}>
							<span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink/70'>
								<Icon className='h-4.5 w-4.5' />
							</span>

							<div className='min-w-0 flex-1'>
								<div className='flex flex-wrap items-start justify-between gap-2'>
									<div>
										<p className='font-semibold text-ink'>{notification.title}</p>
										<p className='mt-0.5 text-xs text-muted'>
											{NOTIFICATION_TYPE_LABEL[notification.type]} · {formatDate(notification.createdAt)}
										</p>
									</div>
									{!notification.isRead && <span className='rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white'>Mới</span>}
								</div>

								<p className='mt-2 text-sm text-ink/80'>{notification.message}</p>

								<div className='mt-3 flex items-center gap-4'>
									{notification.actionUrl &&
										(() => {
											const { to, state } = resolveNotificationLink(notification.actionUrl);
											return (
												<Link
													to={to}
													state={state}
													onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
													className='text-xs font-semibold text-primary-dark hover:underline'>
													Xem chi tiết
												</Link>
											);
										})()}
									{!notification.isRead && (
										<button
											type='button'
											onClick={() => markAsReadMutation.mutate(notification.id)}
											disabled={markAsReadMutation.isPending}
											className='text-xs font-semibold text-ink/70 hover:text-primary-dark disabled:opacity-50 hover:not-disabled:cursor-default'>
											Đánh dấu đã đọc
										</button>
									)}
								</div>
							</div>

							<button
								type='button'
								onClick={() => handleDelete(notification.id)}
								disabled={deletingId === notification.id}
								aria-label='Xóa thông báo'
								className='shrink-0 rounded-lg p-2 text-muted hover:bg-cream-soft hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:cursor-default'>
								<TrashIcon className='h-4 w-4' />
							</button>
						</div>
					);
				})}
			</div>

			{data && <Pagination total={data.pagination.total} defaultLimit={PAGE_SIZE} pageSizeOptions={[]} isLoading={isLoading} />}

			{confirmingDeleteAllRead && (
				<Popup
					title='Xóa thông báo đã đọc'
					description={`Bạn có chắc muốn xóa toàn bộ ${readCount} thông báo đã đọc? Thông báo chưa đọc sẽ được giữ lại. Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa tất cả'
					isConfirming={deleteAllReadMutation.isPending}
					onConfirm={() => deleteAllReadMutation.mutate(undefined, { onSuccess: () => setConfirmingDeleteAllRead(false) })}
					onClose={() => setConfirmingDeleteAllRead(false)}
				/>
			)}
		</div>
	);
};

export default NotificationsTab;
