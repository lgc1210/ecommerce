import Skeleton from "../../../../../admin/dashboard/components/skeleton";

/** Skeleton cho khối chi tiết đơn hàng (trạng thái, tracking, danh sách sản phẩm) khi đang tải. */
const OrderDetailSkeleton = () => (
	<div className='space-y-5'>
		<div className='space-y-2 rounded-2xl border border-border bg-surface p-5'>
			<Skeleton className='h-4 w-32' />
			<Skeleton className='h-3.5 w-40' />
		</div>
		<Skeleton className='h-24 rounded-2xl' />
		<div className='space-y-3'>
			{Array.from({ length: 2 }).map((_, i) => (
				<div key={i} className='flex items-center gap-3 rounded-2xl border border-border bg-surface p-4'>
					<Skeleton className='h-14 w-14 shrink-0 rounded-xl' />
					<div className='flex-1 space-y-2'>
						<Skeleton className='h-3.5 w-2/3' />
						<Skeleton className='h-3 w-1/3' />
					</div>
				</div>
			))}
		</div>
	</div>
);

export default OrderDetailSkeleton;
