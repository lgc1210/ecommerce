import { z } from "zod";
export declare const RevenueSeriesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        period: z.ZodDefault<z.ZodEnum<{
            "7d": "7d";
            "30d": "30d";
            "12m": "12m";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TopProductsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RecentOrdersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const LowStockQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        threshold: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=dashboard.validation.d.ts.map