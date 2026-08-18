import Skeleton from "../../../../admin/dashboard/components/skeleton";

const HeroSectionSkeleton = () => {
	return (
		<section className='border-b border-border bg-cream-soft'>
			<div className='mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
				<div className='space-y-5'>
					<Skeleton className='h-5 w-28 rounded-full' />
					<Skeleton className='h-12 w-full' />
					<Skeleton className='h-12 w-2/3' />
					<Skeleton className='h-4 w-full max-w-md' />
					<Skeleton className='h-4 w-3/4 max-w-md' />
					<div className='flex gap-4 pt-2'>
						<Skeleton className='h-11 w-36 rounded-xl' />
						<Skeleton className='h-11 w-36 rounded-xl' />
					</div>
				</div>
				<Skeleton className='aspect-square w-full max-w-md justify-self-center rounded-2xl' />
			</div>
		</section>
	);
};

export default HeroSectionSkeleton;
