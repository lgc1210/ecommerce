import { useState, type SubmitEvent } from "react";
import AdminTitle from "../../../components/admin-title";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Button from "../../../components/button";
import Popup from "../../../components/popup";
import { useBroadcastNotification } from "../../../features/admin/notification/hooks";
import type { BroadcastNotificationType } from "../../../features/admin/notification/types";
import { BellIcon } from "../../../components/icons";
import { BROADCAST_NOTIFICATION_TYPE } from "../../../shared/constants/notification";

const TYPE_OPTIONS: { value: BroadcastNotificationType; label: string }[] = [
	{ value: BROADCAST_NOTIFICATION_TYPE.promotion, label: "Khuyến mãi" },
	{ value: BROADCAST_NOTIFICATION_TYPE.system, label: "Hệ thống" },
];

type Errors = {
	title?: string;
	message?: string;
};

/**
 * Trang admin gửi thông báo hàng loạt (POST /notifications/broadcast). Route "/admin/notification"
 * được bảo vệ bởi requirePermissionLoader(permissions.notification.broadcast) (xem configs/routes/
 * index.ts), khớp với backend: endpoint này yêu cầu permission "notification:broadcast".
 *
 * Gửi tới TOÀN BỘ customer đang hoạt động — không có lựa chọn "chọn tay từng người" (đã bỏ).
 * Vì tác động tới toàn bộ khách hàng cùng lúc và không thể thu hồi sau khi gửi, form yêu cầu xác
 * nhận qua <Popup variant='danger'> trước khi thực sự gọi API, tương tự các hành động phá hủy
 * hàng loạt khác trong app (vd "Xóa thông báo đã đọc" ở features/client/notification).
 */
const AdminNotificationPage = () => {
	const [type, setType] = useState<BroadcastNotificationType>("promotion");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [actionUrl, setActionUrl] = useState("");
	const [errors, setErrors] = useState<Errors>({});
	const [confirming, setConfirming] = useState(false);

	const broadcastMutation = useBroadcastNotification();

	const validate = () => {
		const nextErrors: Errors = {};
		if (!title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề.";
		if (!message.trim()) nextErrors.message = "Vui lòng nhập nội dung.";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;
		setConfirming(true);
	};

	const handleConfirmSend = () => {
		broadcastMutation.mutate(
			{
				type,
				title: title.trim(),
				message: message.trim(),
				actionUrl: actionUrl.trim() || undefined,
			},
			{
				onSuccess: () => {
					setConfirming(false);
					setTitle("");
					setMessage("");
					setActionUrl("");
					setErrors({});
				},
				onError: () => setConfirming(false),
			},
		);
	};

	return (
		<div className='space-y-6'>
			<AdminTitle title='Gửi thông báo' description='Gửi thông báo khuyến mãi hoặc hệ thống tới toàn bộ khách hàng đang hoạt động.' />

			<form onSubmit={handleSubmit} className='max-w-2xl space-y-5 rounded-2xl border border-border bg-surface p-6'>
				<div className='grid gap-5 sm:grid-cols-2'>
					<FormSelect label='Loại thông báo' value={type} onChange={(e) => setType(e.target.value as BroadcastNotificationType)} options={TYPE_OPTIONS} fullWidth />
					<FormControl label='Đường dẫn khi bấm vào (không bắt buộc)' placeholder='/shop hoặc /product/ao-thun' value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} />
				</div>

				<FormControl label='Tiêu đề' placeholder='Vd: Sale cuối tuần lên đến 50%' value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />

				<FormControl as='textarea' label='Nội dung' placeholder='Nội dung chi tiết của thông báo...' rows={4} value={message} onChange={(e) => setMessage(e.target.value)} error={errors.message} />

				<div className='flex justify-end border-t border-border pt-5'>
					<Button type='submit' icon={<BellIcon className='h-4 w-4' />} iconPosition='left'>
						Gửi cho tất cả khách hàng
					</Button>
				</div>
			</form>

			{confirming && (
				<Popup
					title='Gửi thông báo cho tất cả khách hàng'
					description={`Thông báo "${title}" sẽ được gửi tới TOÀN BỘ khách hàng đang hoạt động. Hành động này không thể thu hồi sau khi gửi. Bạn có chắc chắn?`}
					variant='danger'
					confirmLabel='Gửi ngay'
					isConfirming={broadcastMutation.isPending}
					onConfirm={handleConfirmSend}
					onClose={() => setConfirming(false)}
				/>
			)}
		</div>
	);
};

export default AdminNotificationPage;
