import Skeleton from "../../../../admin/dashboard/components/skeleton";

/** Skeleton cho nhãn số lượng sản phẩm trong header preview giỏ hàng khi đang tải. */
export const CartPreviewCountSkeleton = () => <Skeleton className='h-3.5 w-20' />;

/** Skeleton cho danh sách sản phẩm trong preview giỏ hàng (hover ở icon giỏ hàng) khi đang tải. */
export const CartPreviewListSkeleton = () => (
	<div className='max-h-80 space-y-1 overflow-hidden p-2'>
		{Array.from({ length: 3 }).map((_, i) => (
			<div key={i} className='flex gap-3 p-2'>
				<Skeleton className='h-14 w-14 shrink-0 rounded-md' />
				<div className='min-w-0 flex-1 space-y-1.5 pt-0.5'>
					<Skeleton className='h-3.5 w-4/5' />
					<Skeleton className='h-3 w-2/5' />
					<div className='mt-1 flex items-center justify-between gap-2'>
						<Skeleton className='h-3.5 w-16' />
						<Skeleton className='h-3 w-8' />
					</div>
				</div>
			</div>
		))}
	</div>
);
