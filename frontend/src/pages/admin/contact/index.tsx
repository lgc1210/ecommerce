import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Popup from "../../../components/popup";
import Pagination from "../../../components/pagination";
import AdminTitle from "../../../components/admin-title";
import { CloseIcon, SearchIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseEnumParam } from "../../../utils/searchParams";
import { useContactsQuery, useDeleteContact, useUpdateContactStatus } from "../../../features/admin/contact/hooks";
import type { AdminContact, ContactStatus } from "../../../features/admin/contact/types";
import { CONTACT_STATUS_LABEL } from "../../../features/admin/contact/utils";
import StatusBadge from "../../../features/admin/contact/components/status-badge";
import ContactDetailModal from "../../../features/admin/contact/components/contact-detail-modal";
import Button from "../../../components/button";
import { formatDate } from "../../../utils";
import { SkeletonTableRows } from "../../../shared/components/skeleton";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend, dẫn tới các trang
// "ảo" vượt quá dữ liệu thật (bấm vào sẽ trả về rỗng dù còn sản phẩm).
const PAGE_SIZE = 10;

/**
 * Trang quản trị Contact. Route "/admin/contact" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.contact.manage) (xem configs/routes/index.ts),
 * khớp với backend: mọi endpoint GET/PATCH/DELETE /contacts (trừ tạo mới công
 * khai) đều yêu cầu "contact:manage".
 *
 * Phân trang + filter (search/status) lưu thẳng lên URL query string, cùng
 * pattern với trang User: reload/back-forward vẫn giữ đúng view, copy link
 * chia sẻ được.
 */
const AdminContactPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } = useListQueryParams({
		defaultLimit: PAGE_SIZE,
	});

	const status = parseEnumParam<ContactStatus>(searchParams, "status");

	const { data, isLoading, isFetching } = useContactsQuery({ page, limit, search, status });
	const updateContactStatus = useUpdateContactStatus();
	const deleteContact = useDeleteContact();

	const [selectedContact, setSelectedContact] = useState<AdminContact | null>(null);
	const [deletingContact, setDeletingContact] = useState<AdminContact | null>(null);

	const contacts = data?.data ?? [];
	const pagination = data?.pagination;

	// Tự động mở modal chi tiết nếu vào trang này TỪ 1 THÔNG BÁO ("Liên hệ mới") và bộ lọc "search"
	// (backend search theo tên/email/chủ đề, xem contact.service.ts) chỉ ra ĐÚNG 1 kết quả. CHỈ áp
	// dụng khi đến từ notification, không áp dụng khi admin tự gõ tìm kiếm thủ công — xem comment
	// tương tự ở pages/admin/order/index.tsx.
	const location = useLocation();
	const navigate = useNavigate();

	const fromNotification = Boolean((location.state as { fromNotification?: boolean } | null)?.fromNotification);

	// Derived value:
	// Nếu notification dẫn admin tới trang này và search chỉ trả về đúng 1 contact,
	// contact đó sẽ được tự động dùng làm contact đang active.
	//
	// Không cần useEffect + setSelectedContact() vì đây chỉ là derived state từ
	// location.state + data đã có từ React Query.
	const notificationContact = fromNotification && data?.data.length === 1 ? contacts[0] : null;

	// selectedContact được ưu tiên vì đây là contact admin chủ động chọn.
	// Nếu admin chưa chọn contact nào thì mới dùng contact từ notification.
	const activeContact = selectedContact ?? notificationContact;

	const handleCloseContactModal = () => {
		setSelectedContact(null);

		// Nếu modal hiện tại được mở từ notification thì phải xóa flag
		// khỏi history state. Nếu không, notificationContact sẽ được
		// derive lại ngay sau khi selectedContact = null và modal sẽ mở lại.
		if (fromNotification) {
			navigate(`${location.pathname}${location.search}`, {
				replace: true,
				state: null,
			});
		}
	};

	const handleConfirmDelete = () => {
		if (!deletingContact) return;

		deleteContact.mutate(deletingContact.id, {
			onSuccess: () => {
				setDeletingContact(null);
				setSelectedContact(null);
			},
		});
	};

	return (
		<div className='space-y-6'>
			<AdminTitle title='Liên hệ' description='Xem và xử lý các liên hệ khách hàng gửi từ trang web.' />

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo tên, email, chủ đề...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>

				<FormSelect
					value={status ?? ""}
					onChange={(e) => setFilter("status", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={Object.entries(CONTACT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
				/>

				{hasActiveFilters(["status"]) && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={clearFilters}
						icon={<CloseIcon className='h-4 w-4' />}
						iconPosition='left'
						className='gap-1.5! bg-transparent! px-0! my-auto text-muted! hover:text-ink!'>
						Xoá bộ lọc
					</Button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-180 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Người gửi</th>
							<th className='px-5 py-3.5'>Nguồn gửi</th>
							<th className='px-5 py-3.5'>Chủ đề</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5'>Ngày gửi</th>
						</tr>
					</thead>

					<tbody>
						{isLoading ? (
							<SkeletonTableRows rows={PAGE_SIZE} columns={5} />
						) : contacts.length === 0 ? (
							<tr>
								<td colSpan={5} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy liên hệ nào.
								</td>
							</tr>
						) : (
							contacts.map((contact) => (
								<tr key={contact.id} onClick={() => setSelectedContact(contact)} className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5'>
										<p className='font-semibold text-ink'>{contact.name}</p>
										<p className='truncate text-xs text-muted'>{contact.email}</p>
									</td>

									<td className='px-5 py-3.5'>
										{contact.user ? (
											<span className='inline-flex items-center rounded-full bg-primary-light px-2.5 py-1 text-xs truncate font-semibold text-primary-dark'>Tài khoản #{contact.user.id}</span>
										) : (
											<span className='inline-flex items-center rounded-full bg-ink/10 px-2.5 py-1 text-xs truncate text-ink/60'>Khách vãng lai</span>
										)}
									</td>

									<td className='max-w-70 truncate px-5 py-3.5 text-ink/80'>{contact.subject || "—"}</td>

									<td className='px-5 py-3.5'>
										<StatusBadge status={contact.status} />
									</td>

									<td className='px-5 py-3.5 text-ink/70'>{formatDate(contact.createdAt)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{activeContact && (
				<ContactDetailModal
					contact={activeContact}
					onClose={handleCloseContactModal}
					isUpdatingStatus={updateContactStatus.isPending}
					onChangeStatus={(status) =>
						updateContactStatus.mutate(
							{
								id: activeContact.id,
								status,
							},
							{
								onSuccess: () =>
									setSelectedContact((prev) => ({
										...(prev ?? activeContact),
										status,
									})),
							},
						)
					}
					onRequestDelete={() => setDeletingContact(activeContact)}
				/>
			)}

			{deletingContact && (
				<Popup
					title='Xóa liên hệ'
					description={`Bạn có chắc muốn xóa liên hệ của "${deletingContact.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa liên hệ'
					isConfirming={deleteContact.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingContact(null)}
				/>
			)}
		</div>
	);
};

export default AdminContactPage;
