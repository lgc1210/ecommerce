import BreadCrumb from "../../../components/breadcrumb";
import Skeleton from "../../../shared/components/skeleton";

/** Skeleton cho trang thanh toán (các section bên trái + khối tóm tắt đơn hàng) khi đang tải giỏ hàng. */
const PaymentPageSkeleton = () => (
	<>
		<BreadCrumb title='Thanh toán' description='Xác nhận đơn hàng và hoàn tất thanh toán' />
		<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
			<div className='grid gap-8 lg:grid-cols-12'>
				<div className='space-y-6 lg:col-span-8'>
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className='space-y-3 rounded-2xl border border-border bg-surface p-6'>
							<Skeleton className='h-5 w-40' />
							<Skeleton className='h-16 w-full rounded-xl' />
						</div>
					))}
				</div>
				<div className='lg:col-span-4'>
					<div className='space-y-6'>
						<div className='space-y-3 rounded-2xl border border-border bg-surface p-6'>
							<Skeleton className='h-5 w-32' />
							<Skeleton className='h-10 w-full rounded-xl' />
						</div>
						<div className='space-y-3 rounded-2xl border border-border bg-surface p-6'>
							<Skeleton className='h-5 w-40' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-2/3' />
							<Skeleton className='mt-2 h-11 w-full rounded-xl' />
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
);

export default PaymentPageSkeleton;
