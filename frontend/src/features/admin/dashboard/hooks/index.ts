import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services";
import type {
	DashboardLowStockProduct,
	DashboardOverview,
	DashboardRecentOrder,
	DashboardTopProduct,
	LowStockParams,
	RecentOrdersParams,
	RevenuePeriod,
	RevenueSeries,
	TopProductsParams,
} from "../types";

export const ADMIN_DASHBOARD_QUERY_KEY = ["admin", "dashboard"] as const;

/** Số liệu tổng quan (doanh thu, đơn hàng, người dùng, sản phẩm) — dùng cho các thẻ thống kê đầu trang. */
export const useDashboardOverviewQuery = () => {
	return useQuery<DashboardOverview>({
		queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, "overview"],
		queryFn: async () => {
			const res = await dashboardService.getOverview();
			return res.data.data;
		},
		// Số liệu tổng quan không cần realtime tuyệt đối, làm mới định kỳ để giảm tải backend
		// trong lúc trang dashboard vẫn đang mở.
		refetchInterval: 60_000,
	});
};

/** Chuỗi doanh thu theo ngày/tháng, dùng cho biểu đồ ECharts. Đổi `period` sẽ tự refetch. */
export const useDashboardRevenueSeriesQuery = (period: RevenuePeriod) => {
	return useQuery<RevenueSeries>({
		queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, "revenue", period],
		queryFn: async () => {
			const res = await dashboardService.getRevenueSeries(period);
			return res.data.data;
		},
	});
};

/** Top sản phẩm bán chạy theo số lượng đã bán (trên các đơn chưa bị hủy). */
export const useDashboardTopProductsQuery = (params: TopProductsParams = {}) => {
	return useQuery<DashboardTopProduct[]>({
		queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, "top-products", params],
		queryFn: async () => {
			const res = await dashboardService.getTopProducts(params);
			return res.data.data;
		},
	});
};

/** Danh sách đơn hàng gần đây nhất, dùng cho bảng "Đơn hàng gần đây" trên dashboard. */
export const useDashboardRecentOrdersQuery = (params: RecentOrdersParams = {}) => {
	return useQuery<DashboardRecentOrder[]>({
		queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, "recent-orders", params],
		queryFn: async () => {
			const res = await dashboardService.getRecentOrders(params);
			return res.data.data;
		},
	});
};

/** Sản phẩm (SKU) sắp hết hàng, cảnh báo nhập thêm kho. */
export const useDashboardLowStockQuery = (params: LowStockParams = {}) => {
	return useQuery<DashboardLowStockProduct[]>({
		queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, "low-stock", params],
		queryFn: async () => {
			const res = await dashboardService.getLowStockProducts(params);
			return res.data.data;
		},
	});
};
