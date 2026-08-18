import Skeleton from "../../../shared/components/skeleton";

/** Skeleton cho trang chi tiết sản phẩm (gallery ảnh, thông tin, tabs) khi đang tải theo slug. */
const ProductDetailPageSkeleton = () => (
	<div>
		<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
			<div className='grid gap-10 lg:grid-cols-2'>
				{/* Gallery skeleton */}
				<div>
					<Skeleton className='aspect-square w-full rounded-2xl' />
					<div className='mt-4 grid grid-cols-3 gap-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className='aspect-square rounded-xl' />
						))}
					</div>
				</div>

				{/* Info skeleton */}
				<div className='space-y-5'>
					<Skeleton className='h-4 w-32' />
					<Skeleton className='h-9 w-4/5' />
					<Skeleton className='h-8 w-40' />
					<div className='space-y-2'>
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-2/3' />
					</div>
					<div className='space-y-2'>
						<Skeleton className='h-3.5 w-20' />
						<div className='flex gap-2'>
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className='h-10 w-16 rounded-xl' />
							))}
						</div>
					</div>
					<div className='flex items-center gap-2 pt-2'>
						<Skeleton className='h-10 w-28 rounded-xl' />
						<Skeleton className='h-10 w-36 rounded-xl' />
					</div>
					<div className='grid gap-3 border-t border-border pt-6 sm:grid-cols-2'>
						<Skeleton className='h-4 w-48' />
						<Skeleton className='h-4 w-48' />
					</div>
				</div>
			</div>

			{/* Tabs skeleton */}
			<div className='mt-16'>
				<div className='flex gap-6 border-b border-border pb-3'>
					<Skeleton className='h-4 w-16' />
					<Skeleton className='h-4 w-16' />
					<Skeleton className='h-4 w-16' />
				</div>
				<div className='max-w-3xl space-y-2 py-8'>
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-2/3' />
				</div>
			</div>
		</div>
	</div>
);

export default ProductDetailPageSkeleton;
