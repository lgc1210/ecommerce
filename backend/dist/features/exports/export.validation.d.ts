import { z } from "zod";
export declare const ExportResourceSchema: z.ZodEnum<{
    reviews: "reviews";
    orders: "orders";
    contacts: "contacts";
    users: "users";
    products: "products";
    categories: "categories";
    coupons: "coupons";
    payments: "payments";
}>;
export declare const ExportQuerySchema: z.ZodObject<{
    params: z.ZodObject<{
        resource: z.ZodEnum<{
            reviews: "reviews";
            orders: "orders";
            contacts: "contacts";
            users: "users";
            products: "products";
            categories: "categories";
            coupons: "coupons";
            payments: "payments";
        }>;
    }, z.core.$strip>;
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        roleId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
        categoryId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        discountType: z.ZodOptional<z.ZodString>;
        productId: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodString>;
        method: z.ZodOptional<z.ZodString>;
        isVisible: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ExportResource = z.infer<typeof ExportResourceSchema>;
export type ExportQuery = z.infer<typeof ExportQuerySchema>["query"];
//# sourceMappingURL=export.validation.d.ts.map