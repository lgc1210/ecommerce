import { z } from "zod";
export const ExportResourceSchema = z.enum([
    "users",
    "categories",
    "products",
    "coupons",
    "reviews",
    "contacts",
    "orders",
    "payments",
]);
export const ExportQuerySchema = z.object({
    params: z.object({ resource: ExportResourceSchema }),
    query: z.object({
        search: z.string().max(100).optional(),
        roleId: z.string().regex(/^\d+$/).optional(),
        isActive: z.enum(["true", "false"]).optional(),
        categoryId: z.string().regex(/^\d+$/).optional(),
        status: z.string().max(30).optional(),
        discountType: z.string().max(30).optional(),
        productId: z.string().regex(/^\d+$/).optional(),
        userId: z.string().regex(/^\d+$/).optional(),
        rating: z.string().regex(/^[1-5]$/).optional(),
        method: z.string().max(30).optional(),
        isVisible: z.enum(["true", "false"]).optional(),
        dateFrom: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Ngày bắt đầu không hợp lệ.").optional(),
        dateTo: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Ngày kết thúc không hợp lệ.").optional(),
    }),
});
//# sourceMappingURL=export.validation.js.map