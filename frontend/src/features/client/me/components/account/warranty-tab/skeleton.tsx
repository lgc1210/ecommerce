import { Skeleton, SkeletonCardRows } from "../../../../../../shared/components/skeleton";

/** Skeleton cho tab "Bảo hành" trong trang tài khoản khi đang tải lần đầu. */
const WarrantyTabSkeleton = () => (
	<div className='space-y-8'>
		<div>
			<Skeleton className='mb-3 h-4 w-56' />
			<SkeletonCardRows rows={2} />
		</div>
		<div>
			<Skeleton className='mb-3 h-4 w-44' />
			<SkeletonCardRows rows={3} />
		</div>
	</div>
);

export default WarrantyTabSkeleton;
