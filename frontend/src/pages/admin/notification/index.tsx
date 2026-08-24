import { useState, type SubmitEvent } from "react";
import AdminTitle from "../../../components/admin-title";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Button from "../../../components/button";
import Popup from "../../../components/popup";
import { Tabs, TabItem } from "../../../components/tabs";
import { useBroadcastNotification } from "../../../features/admin/notification/hooks";
import type { BroadcastNotificationType } from "../../../features/admin/notification/types";
import { BellIcon, SendIcon } from "../../../components/icons";
import { BROADCAST_NOTIFICATION_TYPE } from "../../../shared/constants/notification";
import ReceivedTab from "../../../features/admin/notification/components/recieved-tab";

const TYPE_OPTIONS: { value: BroadcastNotificationType; label: string }[] = [
	{ value: BROADCAST_NOTIFICATION_TYPE.promotion, label: "Khuyến mãi" },
	{ value: BROADCAST_NOTIFICATION_TYPE.system, label: "Hệ thống" },
];

type Errors = {
	title?: string;
	message?: string;
};

type Tab = "received" | "broadcast";

/**
 * Trang thông báo của admin, có 2 tab:
 *  - "Thông báo của tôi" (mặc định): xem thông báo NỘI BỘ mà chính admin/manager này nhận được
 *    (đơn hàng mới, tồn kho thấp, thanh toán lỗi, khách hàng đánh giá, cảnh báo hệ thống, liên hệ
 *    mới) — xem features/admin/notification/components/received-tab.
 *  - "Gửi thông báo hàng loạt": form gửi thông báo khuyến mãi/hệ thống tới TOÀN BỘ customer (POST
 *    /notifications/broadcast) — hành vi cũ, giữ nguyên.
 *
 * Route "/admin/notification" được bảo vệ bởi requirePermissionLoader(permissions.notification.broadcast)
 * (xem configs/routes/index.ts) — GÁN CHUNG cho cả 2 tab vì đây là 1 route duy nhất, không tách
 * route riêng cho tab "Thông báo của tôi". Theo seed mặc định (rbac.seed.ts) cả admin lẫn manager
 * đều có permission này nên không ảnh hưởng ai — nhưng LƯU Ý: nếu sau này 1 role bị thu hồi riêng
 * permission "notification:broadcast" (qua RBAC UI) trong khi vẫn giữ các permission vận hành khác
 * (order:update, inventory:update, ...), role đó sẽ mất quyền vào XEM tab "Thông báo của tôi" dù
 * vẫn tiếp tục nhận thông báo bình thường qua dropdown chuông (chuông không có permission gate).
 */
const AdminNotificationPage = () => {
	const [tab, setTab] = useState<Tab>("received");

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
			<AdminTitle title='Thông báo' description='Xem thông báo bạn nhận được, hoặc gửi thông báo tới khách hàng.' />

			<Tabs value={tab} onChange={setTab}>
				<TabItem value='received' icon={<BellIcon className='h-4 w-4' />}>
					Thông báo của tôi
				</TabItem>
				<TabItem value='broadcast' icon={<SendIcon className='h-4 w-4' />}>
					Gửi thông báo hàng loạt
				</TabItem>
			</Tabs>

			{tab === "received" ? (
				<ReceivedTab />
			) : (
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
			)}

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
