import BreadCrumb from "../../../components/breadcrumb";
import Skeleton from "../../../shared/components/skeleton";

/** Skeleton cho trang giỏ hàng (danh sách sản phẩm + khối tổng kết) khi đang tải giỏ hàng. */
const CartPageSkeleton = () => (
	<div>
		<BreadCrumb title='Giỏ hàng' />
		<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
			<div className='grid gap-10 lg:grid-cols-3'>
				<div className='lg:col-span-2'>
					<div className='rounded-2xl border border-border bg-surface px-5'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className='flex gap-4 border-b border-border py-5 last:border-0'>
								<Skeleton className='h-24 w-24 shrink-0 rounded-xl' />
								<div className='flex-1 space-y-2'>
									<Skeleton className='h-4 w-2/3' />
									<Skeleton className='h-3.5 w-1/3' />
									<Skeleton className='h-4 w-24' />
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='h-fit space-y-4 rounded-2xl border border-border bg-surface p-6'>
					<Skeleton className='h-5 w-32' />
					<div className='flex items-center justify-between'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-24' />
					</div>
					<Skeleton className='h-3 w-full' />
					<Skeleton className='mt-2 h-11 w-full rounded-xl' />
				</div>
			</div>
		</div>
	</div>
);

export default CartPageSkeleton;
