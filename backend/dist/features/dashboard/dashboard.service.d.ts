import { type RevenuePeriod } from "./dashboard.utils.js";
declare class DashboardService {
    getOverview(): Promise<{
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        pendingPayments: number;
        totalRevenue: number;
        revenueThisMonth: number;
        revenueLastMonth: number;
        revenueGrowthPercent: number | null;
        ordersByStatus: Record<string, number>;
    }>;
    getRevenueSeries(period: RevenuePeriod): Promise<{
        period: RevenuePeriod;
        buckets: {
            label: string;
            revenue: number;
            orders: number;
        }[];
    }>;
    getTopProducts(limit: number): Promise<{
        skuId: number;
        sku: string;
        productId: number | null;
        productName: string;
        productSlug: string;
        quantitySold: number;
        revenue: number;
    }[]>;
    getRecentOrders(limit: number): Promise<({
        user: {
            email: string;
            id: number;
            name: string;
        } | null;
        payment: {
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        } | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    })[]>;
    getLowStockProducts(threshold: number, limit: number): Promise<({
        product: {
            id: number;
            name: string;
            slug: string;
            isActive: boolean;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number | null;
        sku: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        oldPrice: import("@prisma/client-runtime-utils").Decimal | null;
        stockQuantity: number;
        variationDetails: import("../../generated/prisma/runtime/client.js").JsonValue;
        weightGram: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    })[]>;
}
declare const _default: DashboardService;
export default _default;
//# sourceMappingURL=dashboard.service.d.ts.map