import prisma from "../../config/prisma.js";
import { getPeriodRange, buildRevenueBuckets, computeGrowthPercent, type RevenuePeriod } from "./dashboard.utils.js";

class DashboardService {
	// ==========================================
	// Tổng quan: doanh thu, đơn hàng, người dùng, sản phẩm
	// ==========================================
	async getOverview() {
		const now = new Date();
		const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

		const [totalUsers, totalProducts, totalOrders, pendingPayments, orderStatusGroups, revenueThisMonthAgg, revenueLastMonthAgg, totalRevenueAgg] = await Promise.all([
			prisma.user.count(),
			prisma.product.count({ where: { isActive: true } }),
			prisma.order.count(),
			prisma.payment.count({ where: { paymentStatus: "pending" } }),
			prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
			prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "completed", paidAt: { gte: startOfThisMonth } } }),
			prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "completed", paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
			prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "completed" } }),
		]);

		const revenueThisMonth = Number(revenueThisMonthAgg._sum.amount ?? 0);
		const revenueLastMonth = Number(revenueLastMonthAgg._sum.amount ?? 0);

		const ordersByStatus: Record<string, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
		for (const group of orderStatusGroups) {
			ordersByStatus[group.orderStatus] = group._count._all;
		}

		return {
			totalUsers,
			totalProducts,
			totalOrders,
			pendingPayments,
			totalRevenue: Number(totalRevenueAgg._sum.amount ?? 0),
			revenueThisMonth,
			revenueLastMonth,
			revenueGrowthPercent: computeGrowthPercent(revenueThisMonth, revenueLastMonth),
			ordersByStatus,
		};
	}

	// ==========================================
	// Biểu đồ doanh thu theo thời gian (7 ngày / 30 ngày / 12 tháng gần nhất)
	// ==========================================
	async getRevenueSeries(period: RevenuePeriod) {
		const range = getPeriodRange(period);
		const payments = await prisma.payment.findMany({
			where: { paymentStatus: "completed", paidAt: { gte: range.from, lte: range.to } },
			select: { amount: true, paidAt: true },
		});

		return { period, buckets: buildRevenueBuckets(payments, range) };
	}

	// ==========================================
	// Sản phẩm bán chạy nhất (tính theo số lượng đã bán trên các đơn chưa bị hủy)
	// ==========================================
	async getTopProducts(limit: number) {
		const items = await prisma.orderItem.findMany({
			where: { productSkuId: { not: null }, order: { orderStatus: { not: "cancelled" } } },
			select: {
				quantity: true,
				priceAtPurchase: true,
				productSku: {
					select: { id: true, sku: true, product: { select: { id: true, name: true, slug: true } } },
				},
			},
		});

		const totalsBySku = new Map<number, { skuId: number; sku: string; productId: number | null; productName: string; productSlug: string; quantitySold: number; revenue: number }>();

		for (const item of items) {
			if (!item.productSku) continue;
			const skuId = item.productSku.id;
			const entry = totalsBySku.get(skuId) ?? {
				skuId,
				sku: item.productSku.sku,
				productId: item.productSku.product?.id ?? null,
				productName: item.productSku.product?.name ?? "(Đã xóa)",
				productSlug: item.productSku.product?.slug ?? "",
				quantitySold: 0,
				revenue: 0,
			};
			entry.quantitySold += item.quantity;
			entry.revenue += Number(item.priceAtPurchase) * item.quantity;
			totalsBySku.set(skuId, entry);
		}

		return Array.from(totalsBySku.values())
			.sort((a, b) => b.quantitySold - a.quantitySold)
			.slice(0, limit);
	}

	// ==========================================
	// Đơn hàng gần đây nhất
	// ==========================================
	async getRecentOrders(limit: number) {
		return prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				user: { select: { id: true, name: true, email: true } },
				payment: { select: { paymentMethod: true, paymentStatus: true } },
			},
		});
	}

	// ==========================================
	// Sản phẩm sắp hết hàng (cảnh báo nhập thêm kho)
	// ==========================================
	async getLowStockProducts(threshold: number, limit: number) {
		return prisma.productSku.findMany({
			where: { stockQuantity: { lte: threshold } },
			orderBy: { stockQuantity: "asc" },
			take: limit,
			include: { product: { select: { id: true, name: true, slug: true, isActive: true } } },
		});
	}
}

export default new DashboardService();
