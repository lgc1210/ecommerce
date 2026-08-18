import Skeleton from "../../../../../admin/dashboard/components/skeleton";

/** Skeleton cho danh sách đơn hàng trong tab "Đơn hàng" của trang tài khoản khi đang tải. */
const OrderTabSkeleton = () => (
	<div className='space-y-3'>
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className='flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5'>
				<div className='space-y-2'>
					<Skeleton className='h-4 w-32' />
					<Skeleton className='h-3 w-44' />
				</div>
				<div className='flex items-center gap-4'>
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>
			</div>
		))}
	</div>
);

export default OrderTabSkeleton;
