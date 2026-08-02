import type { ReactNode } from "react";
import Skeleton from "./skeleton";

interface StatCardProps {
	label: string;
	value: ReactNode;
	icon: ReactNode;
	/** Ghi chú phụ dưới value, vd. "so với tháng trước" kèm % tăng trưởng đã format sẵn màu. */
	footer?: ReactNode;
	isLoading?: boolean;
}

/** Thẻ thống kê dùng chung cho hàng đầu trang dashboard (tổng doanh thu, đơn hàng, người dùng...). */
const StatCard = ({ label, value, icon, footer, isLoading }: StatCardProps) => {
	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<p className='text-sm text-muted'>{label}</p>
					{isLoading ? (
						<Skeleton className='mt-2 h-7 w-24' />
					) : (
						<p className='mt-1 truncate text-2xl font-bold text-ink'>{value}</p>
					)}
				</div>
				{isLoading ? (
					<Skeleton className='h-11 w-11 flex-none rounded-xl' />
				) : (
					<div className='flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-light text-primary-dark'>
						{icon}
					</div>
				)}
			</div>
			{isLoading ? (
				<Skeleton className='mt-3 h-3.5 w-32' />
			) : (
				footer && <div className='mt-3 text-xs'>{footer}</div>
			)}
		</div>
	);
};

export default StatCard;
