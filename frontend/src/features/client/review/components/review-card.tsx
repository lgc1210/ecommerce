import { formatDate } from "../../../../utils";
import StarRating from "./star-rating";
import type { PublicReview } from "../types";

interface ReviewCardProps {
	review: PublicReview;
	/** true khi review này đang được nhắm tới từ 1 deep-link (vd click thông báo shop phản hồi) — viền nổi bật tạm thời để khách dễ nhận ra. */
	isHighlighted?: boolean;
}

/** 1 review công khai, kèm phản hồi chính thức của shop (nếu có) — hiển thị trong tab "Đánh giá". */
const ReviewCard = ({ review, isHighlighted = false }: ReviewCardProps) => (
	<li
		id={`review-${review.id}`}
		className={`scroll-mt-24 border-b border-border pb-6 transition-colors duration-700 last:border-0 ${isHighlighted ? "-mx-4 rounded-xl border-b-0 bg-primary/5 px-4 py-4 ring-2 ring-primary/40" : ""}`}>
		<StarRating rating={review.rating} size='sm' />
		<div className='mt-2 flex flex-wrap items-center gap-2'>
			<p className='font-semibold text-ink'>{review.user?.name ?? "Khách hàng"}</p>
			{review.createdAt && <span className='text-xs text-muted'>· {formatDate(review.createdAt)}</span>}
			{review.editCount > 0 && <span className='text-xs text-muted'>(đã chỉnh sửa)</span>}
		</div>
		{review.comment && <p className='mt-1 text-ink/80'>{review.comment}</p>}

		{review.reply && (
			<div className='mt-3 ml-4 rounded-xl border-l-2 border-primary bg-cream-soft p-3'>
				<p className='text-xs font-semibold text-primary-dark'>Phản hồi từ Shop</p>
				<p className='mt-1 text-sm text-ink/80'>{review.reply.replyContent}</p>
			</div>
		)}
	</li>
);

export default ReviewCard;
