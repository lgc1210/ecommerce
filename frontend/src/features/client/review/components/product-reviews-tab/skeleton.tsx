import { Skeleton, SkeletonListItem } from "../../../../../shared/components/skeleton";

/** Skeleton cho tab "Đánh giá" ở trang chi tiết sản phẩm khi đang tải trang lần đầu. */
const ProductReviewsTabSkeleton = () => (
	<div className='max-w-3xl'>
		{/* Tổng hợp điểm đánh giá */}
		<div className='mb-6 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-cream-soft/60 p-5'>
			<div className='space-y-2 text-center'>
				<Skeleton className='mx-auto h-9 w-14' />
				<Skeleton className='mx-auto h-4 w-24' />
				<Skeleton className='mx-auto h-3 w-16' />
			</div>
			<div className='flex-1 min-w-48 space-y-2'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className='h-3.5 w-full' />
				))}
			</div>
		</div>

		{/* Sort row */}
		<div className='mb-4 flex justify-end'>
			<Skeleton className='h-9 w-36 rounded-xl' />
		</div>

		{/* Danh sách review */}
		<div className='space-y-6'>
			{Array.from({ length: 3 }).map((_, i) => (
				<SkeletonListItem key={i} withAvatar={false} />
			))}
		</div>
	</div>
);

export default ProductReviewsTabSkeleton;
