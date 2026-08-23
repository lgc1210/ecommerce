import { Skeleton, SkeletonCardRows } from "../../../../../../shared/components/skeleton";

/** Skeleton cho tab "Đánh giá của tôi" trong trang tài khoản khi đang tải lần đầu. */
const ReviewsTabSkeleton = () => (
	<div className='space-y-8'>
		<div>
			<Skeleton className='mb-3 h-4 w-40' />
			<SkeletonCardRows rows={2} />
		</div>
		<div>
			<Skeleton className='mb-3 h-4 w-32' />
			<SkeletonCardRows rows={3} />
		</div>
	</div>
);

export default ReviewsTabSkeleton;
