import Skeleton from "../../../../../../shared/components/skeleton";

/** Skeleton cho danh sách thông báo trong tab "Quản lý thông báo" khi đang tải. */
const NotificationsTabSkeleton = () => (
	<div className='space-y-3'>
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className='flex items-start gap-3 rounded-2xl border border-border bg-surface p-5'>
				<Skeleton className='mt-0.5 h-9 w-9 shrink-0 rounded-full' />
				<div className='min-w-0 flex-1 space-y-2'>
					<div className='flex items-start justify-between gap-2'>
						<Skeleton className='h-4 w-40' />
						<Skeleton className='h-3 w-16' />
					</div>
					<Skeleton className='h-3 w-28' />
					<Skeleton className='h-3.5 w-full' />
				</div>
			</div>
		))}
	</div>
);

export default NotificationsTabSkeleton;
