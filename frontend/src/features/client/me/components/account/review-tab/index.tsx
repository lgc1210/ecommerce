import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMyReviewsQuery, useReviewableOrderItemsQuery, useDeleteReviewMutation } from "../../../../review/hooks";
import ReviewFormModal from "../../../../review/components/review-form-modal";
import StarRating from "../../../../review/components/star-rating";
import ReviewsTabSkeleton from "./skeleton";
import Button from "../../../../../../components/button";
import Popup from "../../../../../../components/popup";
import Pagination from "../../../../../../components/pagination";
import { StarIcon, TrashIcon, PencilIcon } from "../../../../../../components/icons";
import { formatDate } from "../../../../../../utils";
import { formatCurrency } from "../../../../../../utils/currency";
import { getReviewDaysRemaining } from "../../../../review/utils";
import type { MyReview, ReviewableOrderItem } from "../../../../review/types";

const FALLBACK_IMAGE = "https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=San+pham";
const PAGE_SIZE = 10;
/** Số lần user được phép chỉnh sửa 1 đánh giá — phải khớp MAX_REVIEW_EDIT_COUNT ở backend. */
const MAX_REVIEW_EDIT_COUNT = 1;

/**
 * Tab "Đánh giá của tôi" trong trang tài khoản, gồm 2 phần:
 * 1. Sản phẩm chờ đánh giá — order_item thuộc đơn "delivered", còn trong hạn 30 ngày, chưa review
 *    (GET /reviews/reviewable-items).
 * 2. Đánh giá của tôi — review đã viết, sửa (tối đa 1 lần) / xóa được (GET /reviews/me).
 */
const ReviewsTab = () => {
	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || PAGE_SIZE;

	const { data: reviewableItems, isLoading: isLoadingReviewable } = useReviewableOrderItemsQuery();
	const { data: myReviewsData, isLoading: isLoadingMyReviews } = useMyReviewsQuery({ page, limit });
	const deleteReview = useDeleteReviewMutation();

	const [reviewingItem, setReviewingItem] = useState<ReviewableOrderItem | null>(null);
	const [editingReview, setEditingReview] = useState<MyReview | null>(null);
	const [deletingReview, setDeletingReview] = useState<MyReview | null>(null);

	if (isLoadingReviewable || isLoadingMyReviews) return <ReviewsTabSkeleton />;

	const myReviews = myReviewsData?.data ?? [];

	return (
		<div className='space-y-8'>
			{/* Sản phẩm chờ đánh giá */}
			{reviewableItems && reviewableItems.length > 0 && (
				<div>
					<h3 className='mb-3 text-sm font-semibold text-ink'>Sản phẩm chờ đánh giá</h3>
					<div className='space-y-3'>
						{reviewableItems.map((item) => {
							const daysRemaining = getReviewDaysRemaining(item.order.deliveredAt);
							return (
								<div key={item.id} className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4'>
									<div className='flex items-center gap-3'>
										<img src={item.productSku?.images[0]?.imageUrl ?? FALLBACK_IMAGE} alt={item.productSku?.product?.name ?? "Sản phẩm"} className='h-14 w-14 shrink-0 rounded-lg object-cover' />
										<div>
											<p className='line-clamp-1 font-medium text-ink'>{item.productSku?.product?.name ?? "Sản phẩm"}</p>
											<p className='mt-0.5 text-xs text-muted'>
												Đơn {item.order.orderNumber} · {formatCurrency(Number(item.priceAtPurchase))}
											</p>
											{daysRemaining !== null && <p className='mt-0.5 text-xs font-medium text-primary-dark'>{daysRemaining > 0 ? `Còn ${daysRemaining} ngày để đánh giá` : "Sắp hết hạn đánh giá"}</p>}
										</div>
									</div>
									<Button size='sm' icon={<StarIcon className='h-4 w-4' />} iconPosition='left' onClick={() => setReviewingItem(item)}>
										Viết đánh giá
									</Button>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Đánh giá của tôi */}
			{myReviews.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
					<StarIcon className='mx-auto mb-2 h-6 w-6 text-muted' />
					Bạn chưa viết đánh giá nào.
				</div>
			) : (
				<div className='space-y-3'>
					{myReviews.map((review) => {
						const canEdit = review.editCount < MAX_REVIEW_EDIT_COUNT;
						return (
							<div key={review.id} className='rounded-2xl border border-border bg-surface p-5'>
								<div className='flex flex-wrap items-start justify-between gap-3'>
									<div>
										<p className='font-semibold text-ink'>{review.product.name}</p>
										<div className='mt-1.5 flex flex-wrap items-center gap-2'>
											<StarRating rating={review.rating} size='sm' />
											{review.createdAt && <span className='text-xs text-muted'>{formatDate(review.createdAt)}</span>}
											{!canEdit && <span className='text-xs text-muted'>· Đã chỉnh sửa, không thể sửa thêm</span>}
											{!review.isVisible && <span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600'>Đang bị ẩn</span>}
										</div>
									</div>
									<div className='flex items-center gap-1'>
										{canEdit && (
											<button type='button' onClick={() => setEditingReview(review)} aria-label='Sửa đánh giá' className='rounded-lg p-2 text-muted hover:bg-cream-soft hover:text-ink'>
												<PencilIcon className='h-4 w-4' />
											</button>
										)}
										<button type='button' onClick={() => setDeletingReview(review)} aria-label='Xóa đánh giá' className='rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600'>
											<TrashIcon className='h-4 w-4' />
										</button>
									</div>
								</div>
								{review.comment && <p className='mt-2 text-sm text-ink/80'>{review.comment}</p>}

								{review.reply && (
									<div className='mt-3 ml-4 rounded-xl border-l-2 border-primary bg-cream-soft p-3'>
										<p className='text-xs font-semibold text-primary-dark'>Phản hồi từ Shop</p>
										<p className='mt-1 text-sm text-ink/80'>{review.reply.replyContent}</p>
									</div>
								)}
							</div>
						);
					})}

					{myReviewsData && <Pagination total={myReviewsData.pagination.total} defaultLimit={PAGE_SIZE} pageSizeOptions={[]} isLoading={isLoadingMyReviews} />}
				</div>
			)}

			{reviewingItem && <ReviewFormModal target={{ mode: "create", item: reviewingItem }} onClose={() => setReviewingItem(null)} />}
			{editingReview && <ReviewFormModal target={{ mode: "edit", review: editingReview }} onClose={() => setEditingReview(null)} />}
			{deletingReview && (
				<Popup
					title='Xóa đánh giá'
					description={`Bạn có chắc muốn xóa đánh giá cho "${deletingReview.product.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa đánh giá'
					isConfirming={deleteReview.isPending}
					onConfirm={() => deleteReview.mutate(deletingReview.id, { onSuccess: () => setDeletingReview(null) })}
					onClose={() => setDeletingReview(null)}
				/>
			)}
		</div>
	);
};

export default ReviewsTab;
