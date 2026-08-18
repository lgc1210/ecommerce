import Skeleton from "../../../../admin/dashboard/components/skeleton";

/** Skeleton cho banner carousel sản phẩm nổi bật trên trang chủ khi đang tải. */
const FeaturedProductsCarouselSectionSkeleton = () => (
	<div className='mt-8 flex flex-col-reverse items-center gap-6 rounded-2xl bg-ink p-8 sm:flex-row sm:p-12'>
		<div className='w-full flex-1 space-y-4'>
			<Skeleton className='h-3 w-24 bg-cream/20' />
			<Skeleton className='h-8 w-3/4 bg-cream/20' />
			<Skeleton className='h-7 w-32 bg-cream/20' />
			<Skeleton className='h-9 w-36 rounded-lg bg-cream/20' />
		</div>
		<Skeleton className='h-40 w-40 shrink-0 rounded-2xl bg-cream/20 sm:h-48 sm:w-48' />
	</div>
);

export default FeaturedProductsCarouselSectionSkeleton;
