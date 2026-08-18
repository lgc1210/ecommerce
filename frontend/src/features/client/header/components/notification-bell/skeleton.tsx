import Skeleton from "../../../../admin/dashboard/components/skeleton";

/** Skeleton cho danh sách thông báo trong dropdown chuông thông báo khi đang tải. */
const NotificationBellSkeleton = () => (
	<>
		{Array.from({ length: 3 }).map((_, i) => (
			<div key={i} className='flex items-start gap-3 px-4 py-3'>
				<Skeleton className='mt-0.5 h-8 w-8 shrink-0 rounded-full' />
				<div className='min-w-0 flex-1 space-y-1.5'>
					<Skeleton className='h-3.5 w-2/3' />
					<Skeleton className='h-3 w-full' />
					<Skeleton className='h-2.5 w-16' />
				</div>
			</div>
		))}
	</>
);

export default NotificationBellSkeleton;
