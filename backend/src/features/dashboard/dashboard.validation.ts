import { z } from "zod";

// ==========================================
// Admin: biểu đồ doanh thu
// ==========================================
export const RevenueSeriesQuerySchema = z.object({
	query: z.object({
		period: z.enum(["7d", "30d", "12m"]).default("30d"),
	}),
});

// ==========================================
// Admin: sản phẩm bán chạy
// ==========================================
export const TopProductsQuerySchema = z.object({
	query: z.object({
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});

// ==========================================
// Admin: đơn hàng gần đây
// ==========================================
export const RecentOrdersQuerySchema = z.object({
	query: z.object({
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});

// ==========================================
// Admin: sản phẩm sắp hết hàng
// ==========================================
export const LowStockQuerySchema = z.object({
	query: z.object({
		threshold: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
	}),
});
