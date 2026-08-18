import Skeleton from "../../../../../../shared/components/skeleton";

/** Skeleton cho danh sách liên hệ trong tab "Lịch sử liên hệ" khi đang tải. */
const MyContactsTabSkeleton = () => (
	<div className='space-y-3'>
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className='space-y-3 rounded-2xl border border-border bg-surface p-5'>
				<div className='flex flex-wrap items-start justify-between gap-2'>
					<div className='space-y-1.5'>
						<Skeleton className='h-4 w-40' />
						<Skeleton className='h-3 w-28' />
					</div>
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>
				<Skeleton className='h-3.5 w-full' />
				<Skeleton className='h-3.5 w-2/3' />
			</div>
		))}
	</div>
);

export default MyContactsTabSkeleton;
