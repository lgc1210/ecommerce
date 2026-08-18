import Skeleton from "../../../../admin/dashboard/components/skeleton";

const TrustBadgesSectionSkeleton = () => {
	return (
		<section className='border-b border-border'>
			<div className='mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-3 lg:px-8'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='flex items-start gap-4'>
						<Skeleton className='h-12 w-12 shrink-0 rounded-xl' />
						<div className='flex-1 space-y-2'>
							<Skeleton className='h-4 w-2/3' />
							<Skeleton className='h-3.5 w-full' />
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default TrustBadgesSectionSkeleton;
