import Skeleton from "../../../../admin/dashboard/components/skeleton";

/** Skeleton cho lưới danh mục nổi bật trên trang chủ khi đang tải. */
const FeaturedCategoriesSectionSkeleton = () => (
	<div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
		{Array.from({ length: 5 }).map((_, i) => (
			<div key={i} className='flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5'>
				<Skeleton className='h-20 w-20 rounded-full' />
				<Skeleton className='h-3.5 w-16' />
				<Skeleton className='h-3 w-12' />
			</div>
		))}
	</div>
);

export default FeaturedCategoriesSectionSkeleton;
