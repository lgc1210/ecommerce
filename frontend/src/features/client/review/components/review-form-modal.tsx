import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import StarRatingInput from "./star-rating-input";
import { useCreateReviewMutation, useUpdateReviewMutation } from "../hooks";
import type { MyReview, ReviewableOrderItem } from "../types";

const FALLBACK_IMAGE = "https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=San+pham";

type ReviewFormTarget = { mode: "create"; item: ReviewableOrderItem } | { mode: "edit"; review: MyReview };

interface ReviewFormModalProps {
	target: ReviewFormTarget;
	onClose: () => void;
}

/**
 * Form viết đánh giá mới (từ 1 order_item đã mua, chưa review) hoặc sửa đánh giá đã có.
 * KHÔNG cho đổi sản phẩm/order_item khi sửa — chỉ sửa được rating + comment (khớp
 * UpdateReviewSchema ở backend, vốn không nhận orderItemId).
 */
const ReviewFormModal = ({ target, onClose }: ReviewFormModalProps) => {
	const isEditing = target.mode === "edit";

	const [rating, setRating] = useState(isEditing ? target.review.rating : 0);
	const [comment, setComment] = useState(isEditing ? (target.review.comment ?? "") : "");
	const [ratingError, setRatingError] = useState<string | undefined>(undefined);

	const createReview = useCreateReviewMutation();
	const updateReview = useUpdateReviewMutation();
	const isSubmitting = isEditing ? updateReview.isPending : createReview.isPending;

	const productName = isEditing ? target.review.product.name : (target.item.productSku?.product?.name ?? "Sản phẩm");
	const productImage = isEditing ? undefined : (target.item.productSku?.images[0]?.imageUrl ?? FALLBACK_IMAGE);

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (rating < 1) {
			setRatingError("Vui lòng chọn số sao đánh giá.");
			return;
		}
		setRatingError(undefined);

		if (isEditing) {
			updateReview.mutate({ id: target.review.id, rating, comment: comment.trim() || null }, { onSuccess: onClose });
		} else {
			createReview.mutate({ orderItemId: target.item.id, rating, comment: comment.trim() || undefined }, { onSuccess: onClose });
		}
	};

	return (
		<ModalShell title={isEditing ? "Sửa đánh giá" : "Viết đánh giá"} onClose={onClose} maxWidthClassName='max-w-lg'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='flex items-center gap-3 rounded-xl bg-cream-soft p-3'>
					{productImage && <img src={productImage} alt={productName} className='h-14 w-14 shrink-0 rounded-lg object-cover' />}
					<p className='line-clamp-2 text-sm font-semibold text-ink'>{productName}</p>
				</div>

				{/* Chỉ user được sửa đúng 1 lần (khớp MAX_REVIEW_EDIT_COUNT ở backend) — cảnh báo trước khi lưu, tránh bị bất ngờ. */}
				{isEditing && <p className='rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700'>Bạn chỉ được chỉnh sửa đánh giá này 1 lần duy nhất. Hãy kiểm tra kỹ trước khi lưu.</p>}

				<div>
					<label className='mb-1.5 block text-sm font-medium text-ink'>Chất lượng sản phẩm</label>
					<StarRatingInput value={rating} onChange={setRating} error={ratingError} />
				</div>

				<FormControl as='textarea' label='Nhận xét của bạn' rows={4} placeholder='Chia sẻ cảm nhận của bạn về sản phẩm này...' value={comment} onChange={(e) => setComment(e.target.value)} />

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Gửi đánh giá"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default ReviewFormModal;
