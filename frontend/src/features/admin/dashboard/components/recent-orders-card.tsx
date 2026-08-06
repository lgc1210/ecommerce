import { Link } from "react-router-dom";
import { useDashboardRecentOrdersQuery } from "../hooks";
import { formatCurrency } from "../../../../utils/currency";
import OrderStatusBadge from "../../order/components/order-status-badge";
import PaymentStatusBadge from "../../order/components/payment-status-badge";
import paths from "../../../../configs/constants/paths";
import Skeleton from "./skeleton";
import { formatDate } from "../../../../utils";

const LIMIT = 8;

const RecentOrdersSkeletonRow = () => (
	<tr className='border-b border-border last:border-0'>
		<td className='py-2.5 pr-3'>
			<Skeleton className='h-4 w-20' />
		</td>
		<td className='py-2.5 pr-3'>
			<div className='space-y-1.5'>
				<Skeleton className='h-4 w-28' />
				<Skeleton className='h-3 w-32' />
			</div>
		</td>
		<td className='py-2.5 pr-3'>
			<Skeleton className='h-6 w-24 rounded-full' />
		</td>
		<td className='py-2.5 pr-3'>
			<Skeleton className='h-4 w-24' />
		</td>
		<td className='py-2.5 pr-3'>
			<Skeleton className='h-6 w-20 rounded-full' />
		</td>
		<td className='py-2.5'>
			<Skeleton className='h-4 w-28' />
		</td>
	</tr>
);

/**
 * Bảng đơn hàng gần đây nhất — GET /dashboard/recent-orders. Click 1 dòng điều hướng sang trang
 * quản trị Order kèm ?search=<mã đơn> (khớp param "search" mà useListQueryParams đọc ở đó) để
 * mở đúng đơn đó thay vì lặp lại UI modal chi tiết đơn ở đây.
 */
const RecentOrdersCard = () => {
	const { data, isLoading } = useDashboardRecentOrdersQuery({ limit: LIMIT });
	const orders = data ?? [];

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<h3 className='text-base font-bold text-ink'>Đơn hàng gần đây</h3>
			<p className='mt-0.5 text-xs text-muted'>{LIMIT} đơn hàng mới nhất.</p>

			<div className='mt-3 overflow-x-auto'>
				<table className='w-full min-w-150 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='py-2.5 pr-3'>Mã đơn</th>
							<th className='py-2.5 pr-3'>Khách hàng</th>
							<th className='py-2.5 pr-3'>Thanh toán</th>
							<th className='py-2.5 pr-3'>Tổng tiền</th>
							<th className='py-2.5 pr-3'>Trạng thái</th>
							<th className='py-2.5'>Ngày đặt</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							Array.from({ length: LIMIT }).map((_, i) => <RecentOrdersSkeletonRow key={i} />)
						) : orders.length === 0 ? (
							<tr>
								<td colSpan={6} className='py-8 text-center text-muted'>
									Chưa có đơn hàng nào.
								</td>
							</tr>
						) : (
							orders.map((order) => (
								<tr key={order.id} className='border-b border-border last:border-0'>
									<td className='py-2.5 pr-3'>
										<Link to={`${paths.admin.order}?search=${encodeURIComponent(order.orderNumber)}`} className='font-semibold text-primary-dark hover:underline'>
											{order.orderNumber}
										</Link>
									</td>
									<td className='py-2.5 pr-3'>
										<p className='font-medium text-ink'>{order.user?.name ?? "Khách vãng lai"}</p>
										<p className='truncate text-xs text-muted'>{order.user?.email}</p>
									</td>
									<td className='py-2.5 pr-3'>{order.payment ? <PaymentStatusBadge status={order.payment.paymentStatus} /> : "—"}</td>
									<td className='py-2.5 pr-3 font-medium text-ink'>{formatCurrency(Number(order.totalAmount))}</td>
									<td className='py-2.5 pr-3'>
										<OrderStatusBadge status={order.orderStatus} />
									</td>
									<td className='py-2.5 text-ink/70'>{formatDate(order.createdAt)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentOrdersCard;
