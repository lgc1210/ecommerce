import { useState } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { TrashIcon, UserIcon } from "../../../../components/icons";
import { formatDate } from "../../../../utils";
import StarRating from "./star-rating";
import VisibilityBadge from "./visibility-badge";
import { useHideReview, useUnhideReview, useCreateReviewReply, useUpdateReviewReply, useDeleteReviewReply } from "../hooks";
import type { AdminReview } from "../types";

interface ReviewDetailModalProps {
	review: AdminReview;
	onClose: () => void;
	onRequestDelete: () => void;
}

/**
 * Chi tiết 1 review nhìn từ phía admin: kiểm duyệt ẩn/hiện (kèm lý do, ghi log qua
 * ReviewModerationLog — KHÔNG sửa được nội dung/rating gốc, xem review.service.ts hideReview()),
 * và quản lý phản hồi chính thức của shop (tối đa 1 reply/review).
 */
const ReviewDetailModal = ({ review, onClose, onRequestDelete }: ReviewDetailModalProps) => {
	const [moderationReason, setModerationReason] = useState("");
	const [replyContent, setReplyContent] = useState(review.reply?.replyContent ?? "");
	const [isEditingReply, setIsEditingReply] = useState(false);

	const hideReview = useHideReview();
	const unhideReview = useUnhideReview();
	const createReply = useCreateReviewReply();
	const updateReply = useUpdateReviewReply();
	const deleteReply = useDeleteReviewReply();

	const latestLog = review.moderationLogs[0];
	const isModerating = hideReview.isPending || unhideReview.isPending;

	const handleToggleVisibility = () => {
		if (review.isVisible) {
			hideReview.mutate({ id: review.id, reason: moderationReason.trim() || undefined }, { onSuccess: () => setModerationReason("") });
		} else {
			unhideReview.mutate({ id: review.id, reason: moderationReason.trim() || undefined }, { onSuccess: () => setModerationReason("") });
		}
	};

	const handleSubmitReply = () => {
		if (!replyContent.trim()) return;
		if (review.reply) {
			updateReply.mutate({ id: review.id, replyContent: replyContent.trim() }, { onSuccess: () => setIsEditingReply(false) });
		} else {
			createReply.mutate({ id: review.id, replyContent: replyContent.trim() });
		}
	};

	return (
		<ModalShell title='Chi tiết đánh giá' onClose={onClose} maxWidthClassName='max-w-lg'>
			<div className='space-y-4'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<p className='font-semibold text-ink'>{review.product.name}</p>
						<div className='mt-1.5 flex items-center gap-2'>
							<StarRating rating={review.rating} />
							{review.createdAt && <span className='text-xs text-muted'>{formatDate(review.createdAt)}</span>}
						</div>
					</div>
					<VisibilityBadge isVisible={review.isVisible} />
				</div>

				<div className='flex items-center gap-2 rounded-xl bg-cream-soft p-3 text-sm text-ink'>
					<UserIcon className='h-4 w-4 shrink-0 text-muted' />
					<span className='font-medium'>{review.user?.name ?? "Người dùng đã xóa"}</span>
					{review.editCount > 0 && <span className='text-xs text-muted'>· đã sửa {review.editCount} lần</span>}
				</div>

				{review.comment && <p className='rounded-xl border border-border p-4 text-sm text-ink/80'>{review.comment}</p>}

				{/* Lịch sử kiểm duyệt gần nhất */}
				{latestLog && (
					<div className='rounded-xl border border-border bg-cream-soft/60 p-3 text-xs text-ink/70'>
						<p>
							<span className='font-semibold'>{latestLog.isHidden ? "Đã ẩn" : "Đã hiện lại"}</span> bởi {latestLog.actionByUser.name}
							{latestLog.createdAt && <> · {formatDate(latestLog.createdAt)}</>}
						</p>
						{latestLog.reason && <p className='mt-1'>Lý do: {latestLog.reason}</p>}
					</div>
				)}

				{/* Ẩn / hiện review */}
				<div className='space-y-2 border-t border-border pt-4'>
					<FormControl
						as='textarea'
						rows={2}
						placeholder={review.isVisible ? "Lý do ẩn đánh giá này (tùy chọn)..." : "Lý do hiện lại đánh giá này (tùy chọn)..."}
						value={moderationReason}
						onChange={(e) => setModerationReason(e.target.value)}
					/>
					<div className='flex justify-end'>
						<Button
							size='sm'
							variant='outline'
							disabled={isModerating}
							className={review.isVisible ? "border-red-200 text-red-600 hover:border-red-400 hover:text-red-700" : ""}
							onClick={handleToggleVisibility}>
							{isModerating ? "Đang xử lý..." : review.isVisible ? "Ẩn đánh giá" : "Hiện lại đánh giá"}
						</Button>
					</div>
				</div>

				{/* Phản hồi của Shop */}
				<div className='space-y-2 border-t border-border pt-4'>
					<p className='text-sm font-medium text-ink'>Phản hồi từ Shop</p>

					{review.reply && !isEditingReply ? (
						<div className='rounded-xl bg-cream-soft p-3'>
							<p className='text-sm text-ink/80'>{review.reply.replyContent}</p>
							<p className='mt-1 text-xs text-muted'>
								{review.reply.repliedByUser.name}
								{review.reply.updatedAt && <> · {formatDate(review.reply.updatedAt)}</>}
							</p>
							<div className='mt-2 flex gap-2'>
								<button type='button' onClick={() => setIsEditingReply(true)} className='text-xs font-medium text-primary-dark hover:underline'>
									Sửa phản hồi
								</button>
								<button type='button' onClick={() => deleteReply.mutate(review.id)} disabled={deleteReply.isPending} className='text-xs font-medium text-red-600 hover:underline'>
									Xóa phản hồi
								</button>
							</div>
						</div>
					) : (
						<div className='space-y-2'>
							<FormControl as='textarea' rows={3} placeholder='Viết phản hồi chính thức cho đánh giá này...' value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
							<div className='flex justify-end gap-2'>
								{isEditingReply && (
									<Button type='button' size='sm' variant='outline' onClick={() => setIsEditingReply(false)}>
										Hủy
									</Button>
								)}
								<Button type='button' size='sm' disabled={!replyContent.trim() || createReply.isPending || updateReply.isPending} onClick={handleSubmitReply}>
									{createReply.isPending || updateReply.isPending ? "Đang lưu..." : "Gửi phản hồi"}
								</Button>
							</div>
						</div>
					)}
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
						Xóa đánh giá
					</Button>
				</div>
			</div>
		</ModalShell>
	);
};

export default ReviewDetailModal;
