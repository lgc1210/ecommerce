import { useState } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";
import { MailIcon, TrashIcon, UserIcon } from "../../../../components/icons";
import type { AdminContact, ContactStatus } from "../types";
import { CONTACT_STATUS_LABEL, getNextContactStatusOptions } from "../utils";

interface ContactDetailModalProps {
	contact: AdminContact;
	onClose: () => void;
	onChangeStatus: (status: ContactStatus) => void;
	onRequestDelete: () => void;
	isUpdatingStatus: boolean;
}

const formatDate = (value: string) =>
	new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

/** Modal xem chi tiết 1 liên hệ + đổi trạng thái xử lý + lối vào xóa. Không tự quản lý mở/đóng. */
const ContactDetailModal = ({
	contact,
	onClose,
	onChangeStatus,
	onRequestDelete,
	isUpdatingStatus,
}: ContactDetailModalProps) => {
	const [pendingStatus, setPendingStatus] = useState<ContactStatus>(contact.status);
	const statusOptions = getNextContactStatusOptions(contact.status);
	const hasStatusChanged = pendingStatus !== contact.status;

	return (
		<ModalShell title='Chi tiết liên hệ' onClose={onClose} maxWidthClassName='max-w-lg'>
			<div className='space-y-4'>
				<div>
					<p className='font-semibold text-ink'>{contact.subject || "(Không có chủ đề)"}</p>
					<p className='mt-1 text-xs text-muted'>Gửi lúc {formatDate(contact.createdAt)}</p>
				</div>

				<div className='space-y-2 rounded-xl bg-cream-soft p-4 text-sm'>
					<div className='flex items-center gap-2 text-ink'>
						<UserIcon className='h-4 w-4 shrink-0 text-muted' />
						<span className='font-medium'>{contact.name}</span>
						{/* Nguồn gửi: gắn tài khoản (đã đăng nhập) hay khách vãng lai — xem authenticateOptional ở backend. */}
						{contact.user ? (
							<span className='text-xs text-muted'>
								(tài khoản #{contact.user.id} — {contact.user.email})
							</span>
						) : (
							<span className='rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/60'>Khách vãng lai</span>
						)}
					</div>
					<div className='flex items-center gap-2 text-ink'>
						<MailIcon className='h-4 w-4 shrink-0 text-muted' />
						<a href={`mailto:${contact.email}`} className='hover:underline'>
							{contact.email}
						</a>
					</div>
				</div>

				<div>
					<p className='mb-1.5 text-sm font-medium text-ink'>Nội dung</p>
					<p className='whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm text-ink/80'>
						{contact.message}
					</p>
				</div>

				<div className='flex items-end gap-3'>
					<FormSelect
						label='Trạng thái'
						wrapperClassName='flex-1'
						value={pendingStatus}
						onChange={(e) => setPendingStatus(e.target.value as ContactStatus)}
						options={statusOptions.map((status) => ({ value: status, label: CONTACT_STATUS_LABEL[status] }))}
					/>
					<Button
						size='sm'
						type='button'
						disabled={!hasStatusChanged || isUpdatingStatus}
						onClick={() => onChangeStatus(pendingStatus)}>
						{isUpdatingStatus ? "Đang lưu..." : "Lưu trạng thái"}
					</Button>
				</div>

				<div className='flex justify-end border-t border-border pt-4'>
					<Button
						variant='outline'
						size='sm'
						type='button'
						icon={<TrashIcon className='h-4 w-4' />}
						iconPosition='left'
						className='border-red-200 text-red-600 hover:border-red-400 hover:text-red-700'
						onClick={onRequestDelete}>
						Xóa liên hệ
					</Button>
				</div>
			</div>
		</ModalShell>
	);
};

export default ContactDetailModal;
