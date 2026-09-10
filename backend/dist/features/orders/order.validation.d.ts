import { z } from "zod";
export declare const CreateOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        shippingAddressId: z.ZodNumber;
        paymentMethod: z.ZodEnum<{
            cod: "cod";
            vnpay: "vnpay";
            zalopay: "zalopay";
            momo: "momo";
            stripe: "stripe";
            paypal: "paypal";
        }>;
        couponCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const PreviewShippingFeeSchema: z.ZodObject<{
    body: z.ZodObject<{
        shippingAddressId: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const BuyNowSchema: z.ZodObject<{
    body: z.ZodObject<{
        productSkuId: z.ZodNumber;
        quantity: z.ZodNumber;
        shippingAddressId: z.ZodNumber;
        paymentMethod: z.ZodEnum<{
            cod: "cod";
            vnpay: "vnpay";
            zalopay: "zalopay";
            momo: "momo";
            stripe: "stripe";
            paypal: "paypal";
        }>;
        couponCode: z.ZodOptional<z.ZodString>;
        idempotencyKey: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const PreviewBuyNowShippingFeeSchema: z.ZodObject<{
    body: z.ZodObject<{
        productSkuId: z.ZodNumber;
        quantity: z.ZodNumber;
        shippingAddressId: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListOwnOrdersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            processing: "processing";
            shipped: "shipped";
            delivered: "delivered";
            cancelled: "cancelled";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const OrderIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListOrdersAdminQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            processing: "processing";
            shipped: "shipped";
            delivered: "delivered";
            cancelled: "cancelled";
        }>>;
        userId: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateOrderStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodEnum<{
            pending: "pending";
            processing: "processing";
            shipped: "shipped";
            delivered: "delivered";
            cancelled: "cancelled";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Payload GHN gửi qua callback URL (cấu hình ở trang quản lý shop GHN, không phải qua API) mỗi
 * khi trạng thái đơn thay đổi. Chỉ validate 2 field thực sự dùng tới (OrderCode, Status) — payload
 * thật của GHN có rất nhiều field khác (Fee, Weight, ...) nhưng không cần thiết cho việc đồng bộ.
 */
export declare const GhnWebhookSchema: z.ZodObject<{
    body: z.ZodObject<{
        OrderCode: z.ZodString;
        Status: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>["body"];
export type BuyNowInput = z.infer<typeof BuyNowSchema>["body"];
export type ListOwnOrdersParams = z.infer<typeof ListOwnOrdersQuerySchema>["query"];
export type ListOrdersAdminParams = z.infer<typeof ListOrdersAdminQuerySchema>["query"];
//# sourceMappingURL=order.validation.d.ts.map