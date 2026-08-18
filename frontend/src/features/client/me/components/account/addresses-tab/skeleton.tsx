import Skeleton from "../../../../../admin/dashboard/components/skeleton";

/** Skeleton cho lưới địa chỉ trong tab "Địa chỉ" của trang tài khoản khi đang tải. */
const AddressesTabSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className='space-y-2 rounded-2xl border border-border bg-surface p-5'>
				<Skeleton className='h-4 w-32' />
				<Skeleton className='h-3.5 w-24' />
				<Skeleton className='h-3.5 w-full' />
			</div>
		))}
	</div>
);

export default AddressesTabSkeleton;
