import apiClient from "../../../../configs/apis";
import type { LowStockParams, RecentOrdersParams, RevenuePeriod, TopProductsParams } from "../types";

const dashboardService = {
	getOverview: () => apiClient.get("/dashboard/overview"),
	getRevenueSeries: (period: RevenuePeriod) => apiClient.get("/dashboard/revenue", { params: { period } }),
	getTopProducts: (params: TopProductsParams = {}) =>
		apiClient.get("/dashboard/top-products", { params: { limit: params.limit } }),
	getRecentOrders: (params: RecentOrdersParams = {}) =>
		apiClient.get("/dashboard/recent-orders", { params: { limit: params.limit } }),
	getLowStockProducts: (params: LowStockParams = {}) =>
		apiClient.get("/dashboard/low-stock", { params: { threshold: params.threshold, limit: params.limit } }),
};

export default dashboardService;
