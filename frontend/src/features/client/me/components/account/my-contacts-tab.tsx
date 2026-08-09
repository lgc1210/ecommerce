import { useMyContactsQuery } from "../../../contact/hooks/useContact";
import type { ContactStatus } from "../../../contact/types";
import { MailIcon } from "../../../../../components/icons";

const STATUS_LABEL: Record<ContactStatus, string> = {
	new: "Mới",
	in_progress: "Đang xử lý",
	resolved: "Đã giải quyết",
	closed: "Đã đóng",
};

const STATUS_CLASSNAME: Record<ContactStatus, string> = {
	new: "bg-blue-50 text-blue-600",
	in_progress: "bg-amber-50 text-amber-600",
	resolved: "bg-primary-light text-primary-dark",
	closed: "bg-ink/10 text-ink/60",
};

const formatDate = (value: string) =>
	new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

/**
 * Tab "Liên hệ của tôi" trong trang tài khoản — chỉ đọc (không sửa/xóa được),
 * dùng GET /contacts/me (self-service, không cần permission đặc biệt, chỉ cần đăng nhập).
 * Không phân trang đầy đủ như bảng admin vì đây chỉ là lịch sử tham khảo của
 * riêng khách hàng, thường không nhiều bản ghi — lấy 1 trang 20 liên hệ gần nhất là đủ.
 */
const MyContactsTab = () => {
	const { data, isLoading } = useMyContactsQuery({ page: 1, limit: 20 });
	const contacts = data?.data ?? [];

	if (isLoading) {
		return <p className='py-8 text-center text-sm text-muted'>Đang tải...</p>;
	}

	if (contacts.length === 0) {
		return (
			<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
				<MailIcon className='mx-auto mb-2 h-6 w-6 text-muted' />
				Bạn chưa gửi liên hệ nào.
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			{contacts.map((contact) => (
				<div key={contact.id} className='rounded-2xl border border-border bg-surface p-5'>
					<div className='flex flex-wrap items-start justify-between gap-2'>
						<div>
							<p className='font-semibold text-ink'>{contact.subject || "(Không có chủ đề)"}</p>
							<p className='mt-0.5 text-xs text-muted'>{formatDate(contact.createdAt)}</p>
						</div>
						<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSNAME[contact.status]}`}>{STATUS_LABEL[contact.status]}</span>
					</div>
					<p className='mt-3 whitespace-pre-line text-sm text-ink/80'>{contact.message}</p>
				</div>
			))}
		</div>
	);
};

export default MyContactsTab;
