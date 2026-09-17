import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormSelect from "../../../../components/form-select";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { MailIcon, PhoneIcon, UserIcon } from "../../../../components/icons";
import { formatDate } from "../../../../utils";
import { useWarrantyClaimDetailQuery, useUpdateWarrantyClaimStatus } from "../hooks";
import type { AdminWarrantyClaimDetail } from "../types";
import {
	WARRANTY_CLAIM_STATUS,
	type WarrantyClaimStatus,
	WARRANTY_RESOLUTION_TYPE,
	type WarrantyResolutionType,
} from "../../../../shared/constants/warranty";
import {
	WARRANTY_CLAIM_STATUS_LABEL,
	WARRANTY_RESOLUTION_TYPE_LABEL,
	getNextWarrantyClaimStatusOptions,
	isTerminalWarrantyClaimStatus,
} from "../utils";
import WarrantyClaimStatusBadge from "./warranty-claim-status-badge";

interface WarrantyClaimDetailModalProps {
	claimId: number;
	onClose: () => void;
}

interface WarrantyClaimDetailContentProps {
	claim: AdminWarrantyClaimDetail;
}

/**
 * Tách riêng phần nội dung để state form (pendingStatus/staffNote/...) khởi tạo lại (qua `key` ở
 * component cha WarrantyClaimDetailModal) mỗi khi claim.status đổi trên server sau khi lưu thành
 * công — giống pattern OrderDetailContent/OrderDetailModal ở feature order.
 */
const WarrantyClaimDetailContent = ({ claim }: WarrantyClaimDetailContentProps) => {
	const updateStatus = useUpdateWarrantyClaimStatus();

	const statusOptions = getNextWarrantyClaimStatusOptions(claim.status);
	const [pendingStatus, setPendingStatus] = useState<WarrantyClaimStatus | "">(statusOptions[0] ?? "");
	const [staffNote, setStaffNote] = useState("");
	const [resolutionType, setResolutionType] = useState<WarrantyResolutionType | "">("");
	const [repairFee, setRepairFee] = useState("");
	const [errors, setErrors] = useState<{ staffNote?: string; resolutionType?: string }>({});

	const product = claim.orderItem.productSku?.product;

	const validate = () => {
		const nextErrors: { staffNote?: string; resolutionType?: string } = {};
		if (pendingStatus === WARRANTY_CLAIM_STATUS.rejected && !staffNote.trim()) {
			nextErrors.staffNote = "Cần ghi rõ lý do khi từ chối yêu cầu bảo hành.";
		}
		if (pendingStatus === WARRANTY_CLAIM_STATUS.completed && !resolutionType) {
			nextErrors.resolutionType = "Cần chọn cách giải quyết khi hoàn tất claim.";
		}
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!pendingStatus || !validate()) return;

		updateStatus.mutate({
			id: claim.id,
			status: pendingStatus as Exclude<WarrantyClaimStatus, "pending">,
			staffNote: staffNote.trim() || undefined,
			resolutionType:
				pendingStatus === WARRANTY_CLAIM_STATUS.completed ? (resolutionType as WarrantyResolutionType) : undefined,
			repairFee: pendingStatus === WARRANTY_CLAIM_STATUS.completed && repairFee.trim() ? Number(repairFee) : undefined,
		});
	};

	return (
		<div className='space-y-5'>
			{/* Header */}
			<div className='flex flex-wrap items-start justify-between gap-2'>
				<div>
					<p className='font-semibold text-ink'>{claim.claimNumber}</p>
					<p className='mt-1 text-xs text-muted'>Gửi lúc {formatDate(claim.createdAt ?? "")}</p>
				</div>
				<WarrantyClaimStatusBadge status={claim.status} />
			</div>

			{/* Khách hàng */}
			<div className='space-y-2 rounded-xl bg-cream-soft p-4 text-sm'>
				<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Khách hàng</p>
				<div className='flex items-center gap-2 text-ink'>
					<UserIcon className='h-4 w-4 shrink-0 text-muted' />
					{claim.user.name}
				</div>
				<div className='flex items-center gap-2 text-ink/80'>
					<MailIcon className='h-4 w-4 shrink-0 text-muted' />
					{claim.user.email}
				</div>
				{claim.user.phone && (
					<div className='flex items-center gap-2 text-ink/80'>
						<PhoneIcon className='h-4 w-4 shrink-0 text-muted' />
						{claim.user.phone}
					</div>
				)}
			</div>

			{/* Sản phẩm + bảo hành */}
			<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
				<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Sản phẩm</p>
				<p className='font-medium text-ink'>{product?.name ?? "Sản phẩm không còn tồn tại"}</p>
				{claim.productUnit && <p className='text-xs text-muted'>Serial: {claim.productUnit.serialNumber}</p>}
				<p className='text-xs text-muted'>
					Hạn bảo hành: {formatDate(claim.warrantyStartAt)} — {formatDate(claim.warrantyEndAt)}
				</p>
				{claim.warrantyPolicy && <p className='text-xs text-muted'>Chính sách: {claim.warrantyPolicy.name}</p>}
			</div>

			{/* Mô tả lỗi + ảnh */}
			<div className='space-y-2'>
				<p className='text-xs font-semibold uppercase tracking-wider text-muted'>Mô tả lỗi từ khách</p>
				<p className='rounded-xl border border-border p-4 text-sm text-ink/80 whitespace-pre-line'>
					{claim.issueDescription}
				</p>
				{claim.imageUrls && claim.imageUrls.length > 0 && (
					<div className='flex flex-wrap gap-2'>
						{claim.imageUrls.map((url) => (
							<a key={url} href={url} target='_blank' rel='noreferrer'>
								<img
									src={url}
									alt='Ảnh minh chứng lỗi'
									className='h-20 w-20 rounded-lg border border-border object-cover'
								/>
							</a>
						))}
					</div>
				)}
			</div>

			{/* Lịch sử xử lý */}
			{claim.statusLogs.length > 0 && (
				<div className='space-y-2'>
					<p className='text-xs font-semibold uppercase tracking-wider text-muted'>Lịch sử xử lý</p>
					<div className='space-y-2'>
						{claim.statusLogs.map((log) => (
							<div key={log.id} className='rounded-xl border border-border p-3 text-sm'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<p className='font-medium text-ink'>
										{log.fromStatus ? `${WARRANTY_CLAIM_STATUS_LABEL[log.fromStatus]} → ` : ""}
										{WARRANTY_CLAIM_STATUS_LABEL[log.toStatus]}
									</p>
									<p className='text-xs text-muted'>{formatDate(log.createdAt ?? "")}</p>
								</div>
								<p className='mt-0.5 text-xs text-muted'>Bởi {log.actionByUser.name}</p>
								{log.note && <p className='mt-1 text-ink/80'>{log.note}</p>}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Form đổi trạng thái */}
			{!isTerminalWarrantyClaimStatus(claim.status) && (
				<form onSubmit={handleSubmit} className='space-y-3 rounded-xl border border-border p-4'>
					<p className='text-xs font-semibold uppercase tracking-wider text-muted'>Cập nhật trạng thái</p>
					<FormSelect
						fullWidth
						value={pendingStatus}
						onChange={(e) => setPendingStatus(e.target.value as WarrantyClaimStatus)}
						options={statusOptions.map((value) => ({ value, label: WARRANTY_CLAIM_STATUS_LABEL[value] }))}
					/>

					{pendingStatus === WARRANTY_CLAIM_STATUS.completed && (
						<>
							<FormSelect
								label='Cách giải quyết'
								fullWidth
								value={resolutionType}
								onChange={(e) => setResolutionType(e.target.value as WarrantyResolutionType)}
								placeholder='Chọn cách giải quyết...'
								options={Object.entries(WARRANTY_RESOLUTION_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
								error={errors.resolutionType}
							/>
							{resolutionType === WARRANTY_RESOLUTION_TYPE.replaced && (
								<p className='rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700'>
									Lưu ý: hệ thống chưa tự động xuất kho máy mới hay đánh dấu máy cũ hỏng — vui lòng xử lý phần kho thủ
									công.
								</p>
							)}
							<FormControl
								label='Phí sửa chữa (nếu ngoài điều kiện bảo hành)'
								type='number'
								step='any'
								value={repairFee}
								onChange={(e) => setRepairFee(e.target.value)}
								placeholder='Miễn phí'
							/>
						</>
					)}

					<FormControl
						as='textarea'
						rows={3}
						label={pendingStatus === WARRANTY_CLAIM_STATUS.rejected ? "Lý do từ chối" : "Ghi chú (tuỳ chọn)"}
						value={staffNote}
						onChange={(e) => setStaffNote(e.target.value)}
						error={errors.staffNote}
					/>

					<div className='flex justify-end'>
						<Button type='submit' size='sm' disabled={updateStatus.isPending || !pendingStatus}>
							{updateStatus.isPending ? "Đang lưu..." : "Cập nhật trạng thái"}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
};

const WarrantyClaimDetailModal = ({ claimId, onClose }: WarrantyClaimDetailModalProps) => {
	const { data, isLoading } = useWarrantyClaimDetailQuery(claimId);
	const claim = data?.data;

	return (
		<ModalShell title='Chi tiết yêu cầu bảo hành' onClose={onClose} maxWidthClassName='max-w-2xl'>
			{isLoading || !claim ? (
				<p className='py-8 text-center text-sm text-muted'>Đang tải...</p>
			) : (
				<WarrantyClaimDetailContent key={claim.status} claim={claim} />
			)}
		</ModalShell>
	);
};

export default WarrantyClaimDetailModal;
