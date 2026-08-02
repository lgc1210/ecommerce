import { useState } from "react";
import AdminTitle from "../../../components/admin-title";
import { BoxIcon, CartIcon, ClockIcon, CreditCardIcon, UsersIcon } from "../../../components/icons";
import { formatCurrency } from "../../../utils/currency";
import { useDashboardOverviewQuery } from "../../../features/admin/dashboard/hooks";
import { formatGrowthPercent } from "../../../features/admin/dashboard/utils";
import type { RevenuePeriod } from "../../../features/admin/dashboard/types";
import StatCard from "../../../features/admin/dashboard/components/stat-card";
import RevenueChart from "../../../features/admin/dashboard/components/revenue-chart";
import OrderStatusChart from "../../../features/admin/dashboard/components/order-status-chart";
import TopProductsCard from "../../../features/admin/dashboard/components/top-products-card";
import LowStockCard from "../../../features/admin/dashboard/components/low-stock-card";
import RecentOrdersCard from "../../../features/admin/dashboard/components/recent-orders-card";

/**
 * Trang Dashboard quản trị. Route "/admin" và "/admin/dashboard" đều bảo vệ bởi
 * requirePermissionLoader(permissions.dashboard.read) (xem configs/routes/index.ts), khớp với
 * backend: cả 5 endpoint /dashboard/* đều yêu cầu permission "dashboard:read".
 *
 * Mỗi khối (thẻ thống kê, biểu đồ doanh thu, biểu đồ trạng thái đơn, top sản phẩm, sắp hết
 * hàng, đơn hàng gần đây) tự gọi hook riêng của nó — không có 1 query tổng — để mỗi phần tự
 * loading/refetch độc lập, không kéo cả trang trắng khi chỉ 1 endpoint chậm.
 */
const AdminDashboardPage = () => {
	const [period, setPeriod] = useState<RevenuePeriod>("30d");
	const { data: overview, isLoading: isOverviewLoading } = useDashboardOverviewQuery();

	const growthLabel = formatGrowthPercent(overview?.revenueGrowthPercent ?? null);
	const isGrowthPositive = (overview?.revenueGrowthPercent ?? 0) >= 0;

	return (
		<div className='space-y-6'>
			<AdminTitle title='Dashboard' description='Tổng quan hoạt động kinh doanh của cửa hàng.' />

			{/* Thẻ thống kê */}
			<div className='grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5'>
				<StatCard
					label='Tổng doanh thu'
					value={formatCurrency(overview?.totalRevenue ?? 0)}
					icon={<CreditCardIcon className='h-5 w-5' />}
					isLoading={isOverviewLoading}
				/>
				<StatCard
					label='Doanh thu tháng này'
					value={formatCurrency(overview?.revenueThisMonth ?? 0)}
					icon={<CreditCardIcon className='h-5 w-5' />}
					isLoading={isOverviewLoading}
					footer={
						growthLabel ? (
							<span className={isGrowthPositive ? "font-semibold text-primary-dark" : "font-semibold text-red-600"}>
								{growthLabel}
							</span>
						) : (
							<span className='text-muted'>Chưa có dữ liệu so sánh</span>
						)
					}
				/>
				<StatCard
					label='Tổng đơn hàng'
					value={overview?.totalOrders ?? 0}
					icon={<CartIcon className='h-5 w-5' />}
					isLoading={isOverviewLoading}
				/>
				<StatCard
					label='Tổng người dùng'
					value={overview?.totalUsers ?? 0}
					icon={<UsersIcon className='h-5 w-5' />}
					isLoading={isOverviewLoading}
				/>
				<StatCard
					label='Sản phẩm đang bán'
					value={overview?.totalProducts ?? 0}
					icon={<BoxIcon className='h-5 w-5' />}
					isLoading={isOverviewLoading}
					footer={
						(overview?.pendingPayments ?? 0) > 0 ? (
							<span className='inline-flex items-center gap-1 text-amber-600'>
								<ClockIcon className='h-3.5 w-3.5' />
								{overview?.pendingPayments} thanh toán đang chờ
							</span>
						) : undefined
					}
				/>
			</div>

			{/* Biểu đồ doanh thu + trạng thái đơn */}
			<div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<RevenueChart period={period} onChangePeriod={setPeriod} />
				</div>
				<OrderStatusChart ordersByStatus={overview?.ordersByStatus} isLoading={isOverviewLoading} />
			</div>

			{/* Top sản phẩm + sắp hết hàng */}
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
				<TopProductsCard />
				<LowStockCard />
			</div>

			{/* Đơn hàng gần đây */}
			<RecentOrdersCard />
		</div>
	);
};

export default AdminDashboardPage;
