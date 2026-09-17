import ModalShell from "../../../../components/modal-shell";
import Button from "../../../../components/button";
import Popup from "../../../../components/popup";
import { useState } from "react";
import { formatDate } from "../../../../utils";
import { useMyWarrantyClaimDetailQuery, useCancelWarrantyClaim } from "../hooks";
import { WARRANTY_CLAIM_STATUS_LABEL, WARRANTY_RESOLUTION_TYPE_LABEL, canCancelWarrantyClaim } from "../utils";
import WarrantyClaimStatusBadge from "./warranty-claim-status-badge";

interface WarrantyClaimDetailModalProps {
	claimId: number;
	onClose: () => void;
}

const WarrantyClaimDetailModal = ({ claimId, onClose }: WarrantyClaimDetailModalProps) => {
	const { data, isLoading } = useMyWarrantyClaimDetailQuery(claimId);
	const cancelClaim = useCancelWarrantyClaim();
	const [confirmingCancel, setConfirmingCancel] = useState(false);
	const claim = data?.data;

	const handleConfirmCancel = () => {
		cancelClaim.mutate(claimId, {
			onSuccess: () => {
				setConfirmingCancel(false);
				onClose();
			},
		});
	};

	return (
		<ModalShell title='Chi tiết yêu cầu bảo hành' onClose={onClose} maxWidthClassName='max-w-lg'>
			{isLoading || !claim ? (
				<p className='py-8 text-center text-sm text-muted'>Đang tải...</p>
			) : (
				<div className='space-y-5'>
					<div className='flex flex-wrap items-start justify-between gap-2'>
						<div>
							<p className='font-semibold text-ink'>{claim.claimNumber}</p>
							<p className='mt-1 text-xs text-muted'>Gửi lúc {formatDate(claim.createdAt ?? "")}</p>
						</div>
						<WarrantyClaimStatusBadge status={claim.status} />
					</div>

					<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
						<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Sản phẩm</p>
						<p className='font-medium text-ink'>
							{claim.orderItem.productSku?.product?.name ?? "Sản phẩm không còn tồn tại"}
						</p>
						{claim.productUnit && <p className='text-xs text-muted'>Serial: {claim.productUnit.serialNumber}</p>}
						<p className='text-xs text-muted'>
							Hạn bảo hành: {formatDate(claim.warrantyStartAt)} — {formatDate(claim.warrantyEndAt)}
						</p>
					</div>

					<div className='space-y-2'>
						<p className='text-xs font-semibold uppercase tracking-wider text-muted'>Mô tả lỗi bạn đã gửi</p>
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

					{(claim.staffNote || claim.resolutionType) && (
						<div className='space-y-1.5 rounded-xl bg-cream-soft p-4 text-sm'>
							<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Phản hồi từ cửa hàng</p>
							{claim.resolutionType && (
								<p className='text-ink'>Kết quả: {WARRANTY_RESOLUTION_TYPE_LABEL[claim.resolutionType]}</p>
							)}
							{claim.staffNote && <p className='text-ink/80'>{claim.staffNote}</p>}
						</div>
					)}

					{claim.statusLogs.length > 0 && (
						<div className='space-y-2'>
							<p className='text-xs font-semibold uppercase tracking-wider text-muted'>Lịch sử xử lý</p>
							<div className='space-y-2'>
								{claim.statusLogs.map((log) => (
									<div
										key={log.id}
										className='flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm'>
										<p className='font-medium text-ink'>{WARRANTY_CLAIM_STATUS_LABEL[log.toStatus]}</p>
										<p className='text-xs text-muted'>{formatDate(log.createdAt ?? "")}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{canCancelWarrantyClaim(claim.status) && (
						<div className='flex justify-end pt-2'>
							<Button type='button' variant='outline' size='sm' onClick={() => setConfirmingCancel(true)}>
								Hủy yêu cầu
							</Button>
						</div>
					)}
				</div>
			)}

			{confirmingCancel && (
				<Popup
					title='Hủy yêu cầu bảo hành'
					description='Bạn có chắc muốn hủy yêu cầu bảo hành này?'
					variant='danger'
					confirmLabel='Hủy yêu cầu'
					isConfirming={cancelClaim.isPending}
					onConfirm={handleConfirmCancel}
					onClose={() => setConfirmingCancel(false)}
				/>
			)}
		</ModalShell>
	);
};

export default WarrantyClaimDetailModal;
