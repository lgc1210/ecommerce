import type { OrderStatus, PaymentMethod, PaymentStatus } from "../../order/types";

/** Khớp RevenuePeriod ở backend (dashboard.utils.ts). */
export type RevenuePeriod = "7d" | "30d" | "12m";

/** Khớp response của GET /dashboard/overview (dashboardService.getOverview). */
export interface DashboardOverview {
	totalUsers: number;
	totalProducts: number;
	totalOrders: number;
	pendingPayments: number;
	totalRevenue: number;
	revenueThisMonth: number;
	revenueLastMonth: number;
	/** null khi cả 2 kỳ (tháng này/tháng trước) đều bằng 0 -> không tính được % tăng trưởng. */
	revenueGrowthPercent: number | null;
	ordersByStatus: Record<OrderStatus, number>;
}

/** 1 điểm dữ liệu trong biểu đồ doanh thu (buildRevenueBuckets ở backend). */
export interface RevenueBucket {
	/** "YYYY-MM-DD" nếu period=7d/30d, "YYYY-MM" nếu period=12m. */
	label: string;
	revenue: number;
	orders: number;
}

/** Khớp response của GET /dashboard/revenue. */
export interface RevenueSeries {
	period: RevenuePeriod;
	buckets: RevenueBucket[];
}

/** 1 dòng trong response của GET /dashboard/top-products. */
export interface DashboardTopProduct {
	skuId: number;
	sku: string;
	productId: number | null;
	productName: string;
	productSlug: string;
	quantitySold: number;
	revenue: number;
}

/** 1 đơn hàng trong response của GET /dashboard/recent-orders (Prisma include user + payment rút gọn). */
export interface DashboardRecentOrder {
	id: number;
	orderNumber: string;
	totalAmount: string;
	orderStatus: OrderStatus;
	createdAt: string;
	user: { id: number; name: string; email: string } | null;
	payment: { paymentMethod: PaymentMethod; paymentStatus: PaymentStatus } | null;
}

/** 1 SKU trong response của GET /dashboard/low-stock. */
export interface DashboardLowStockProduct {
	id: number;
	sku: string;
	stockQuantity: number;
	product: { id: number; name: string; slug: string; isActive: boolean } | null;
}

export interface TopProductsParams {
	limit?: number;
}

export interface RecentOrdersParams {
	limit?: number;
}

export interface LowStockParams {
	threshold?: number;
	limit?: number;
}
