import { useState } from "react";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Popup from "../../../components/popup";
import Pagination from "../../../components/pagination";
import AdminTitle from "../../../components/admin-title";
import { CloseIcon, SearchIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { formatDate } from "../../../utils";
import { useReviewsAdminQuery, useAdminDeleteReview } from "../../../features/admin/review/hooks";
import type { AdminReview } from "../../../features/admin/review/types";
import StarRating from "../../../features/admin/review/components/star-rating";
import VisibilityBadge from "../../../features/admin/review/components/visibility-badge";
import ReviewDetailModal from "../../../features/admin/review/components/review-detail-modal";
import Button from "../../../components/button";
import { SkeletonTableRows } from "../../../shared/components/skeleton";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination).
const PAGE_SIZE = 10;

const VISIBILITY_OPTIONS = [
	{ value: "true", label: "Đang hiển thị" },
	{ value: "false", label: "Đã ẩn" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((star) => ({ value: String(star), label: `${star} sao` }));

/**
 * Trang quản trị đánh giá sản phẩm. Route "/admin/review" được bảo vệ bởi
 * requirePermissionLoader(permissions.review.update) (xem configs/routes/index.ts), khớp với
 * backend: mọi endpoint GET/PATCH/DELETE /reviews/admin/* đều yêu cầu "review:update".
 */
const AdminReviewPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } = useListQueryParams({
		defaultLimit: PAGE_SIZE,
	});

	const isVisibleParam = searchParams.get("isVisible");
	const ratingParam = searchParams.get("rating");

	const { data, isLoading, isFetching } = useReviewsAdminQuery({
		page,
		limit,
		search,
		isVisible: isVisibleParam === null ? undefined : isVisibleParam === "true",
		rating: ratingParam ? Number(ratingParam) : undefined,
	});
	const deleteReview = useAdminDeleteReview();

	const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
	const [deletingReview, setDeletingReview] = useState<AdminReview | null>(null);

	const reviews = data?.data ?? [];
	const pagination = data?.pagination;

	const handleConfirmDelete = () => {
		if (!deletingReview) return;
		deleteReview.mutate(deletingReview.id, {
			onSuccess: () => {
				setDeletingReview(null);
				setSelectedReview(null);
			},
		});
	};

	return (
		<div className='space-y-6'>
			<AdminTitle title='Đánh giá sản phẩm' description='Xem, kiểm duyệt (ẩn/hiện) và phản hồi các đánh giá của khách hàng.' />

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo nội dung nhận xét...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect value={ratingParam ?? ""} onChange={(e) => setFilter("rating", e.target.value || undefined)} placeholder='Tất cả số sao' options={RATING_OPTIONS} />
				<FormSelect value={isVisibleParam ?? ""} onChange={(e) => setFilter("isVisible", e.target.value || undefined)} placeholder='Tất cả trạng thái' options={VISIBILITY_OPTIONS} />
				{hasActiveFilters(["rating", "isVisible"]) && (
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
				<table className='w-full min-w-200 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Sản phẩm</th>
							<th className='px-5 py-3.5'>Người đánh giá</th>
							<th className='px-5 py-3.5'>Điểm</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5'>Ngày đánh giá</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<SkeletonTableRows rows={PAGE_SIZE} columns={5} />
						) : reviews.length === 0 ? (
							<tr>
								<td colSpan={5} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy đánh giá nào.
								</td>
							</tr>
						) : (
							reviews.map((review) => (
								<tr key={review.id} onClick={() => setSelectedReview(review)} className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='max-w-70 truncate px-5 py-3.5 font-medium text-ink'>{review.product.name}</td>
									<td className='px-5 py-3.5 text-ink/80'>{review.user?.name ?? "Người dùng đã xóa"}</td>
									<td className='px-5 py-3.5'>
										<StarRating rating={review.rating} />
									</td>
									<td className='px-5 py-3.5'>
										<VisibilityBadge isVisible={review.isVisible} />
									</td>
									<td className='px-5 py-3.5 text-ink/70'>{review.createdAt ? formatDate(review.createdAt) : "—"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{selectedReview && <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} onRequestDelete={() => setDeletingReview(selectedReview)} />}
			{deletingReview && (
				<Popup
					title='Xóa đánh giá'
					description={`Bạn có chắc muốn xóa đánh giá này cho "${deletingReview.product.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa đánh giá'
					isConfirming={deleteReview.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingReview(null)}
				/>
			)}
		</div>
	);
};

export default AdminReviewPage;
