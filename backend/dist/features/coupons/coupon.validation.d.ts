import { z } from "zod";
export declare const RequestWelcomeCouponSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ValidateCouponSchema: z.ZodObject<{
    body: z.ZodObject<{
        code: z.ZodString;
        orderSubtotal: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListCouponsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
        discountType: z.ZodOptional<z.ZodEnum<{
            fixed: "fixed";
            percentage: "percentage";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CouponIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateCouponSchema: z.ZodObject<{
    body: z.ZodObject<{
        code: z.ZodString;
        discountType: z.ZodEnum<{
            fixed: "fixed";
            percentage: "percentage";
        }>;
        discountValue: z.ZodNumber;
        minOrderValue: z.ZodOptional<z.ZodNumber>;
        maxDiscountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        startsAt: z.ZodString;
        expiresAt: z.ZodString;
        usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateCouponSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        code: z.ZodOptional<z.ZodString>;
        discountType: z.ZodOptional<z.ZodEnum<{
            fixed: "fixed";
            percentage: "percentage";
        }>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        minOrderValue: z.ZodOptional<z.ZodNumber>;
        maxDiscountValue: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        startsAt: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        usageLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>["body"];
export type UpdateCouponInput = z.infer<typeof UpdateCouponSchema>["body"];
export type ListCouponsParams = z.infer<typeof ListCouponsQuerySchema>["query"];
//# sourceMappingURL=coupon.validation.d.ts.map