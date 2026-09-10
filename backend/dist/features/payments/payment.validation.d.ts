import { z } from "zod";
export declare const OwnPaymentParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ConfirmOwnPaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        transactionId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Đổi phương thức thanh toán cho đơn của chính khách — dùng ĐẦY ĐỦ danh sách PaymentMethod (kể cả
 * zalopay, khác với `paymentMethodEnum` phía trên đang thiếu zalopay) để khớp với danh sách khách
 * chọn lúc checkout (xem order.validation.ts). service tự kiểm tra điều kiện được phép đổi hay không.
 */
export declare const ChangeOwnPaymentMethodSchema: z.ZodObject<{
    params: z.ZodObject<{
        orderId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        paymentMethod: z.ZodEnum<{
            cod: "cod";
            vnpay: "vnpay";
            zalopay: "zalopay";
            momo: "momo";
            stripe: "stripe";
            paypal: "paypal";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListPaymentsAdminQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            completed: "completed";
            failed: "failed";
            refunded: "refunded";
        }>>;
        method: z.ZodOptional<z.ZodEnum<{
            cod: "cod";
            vnpay: "vnpay";
            zalopay: "zalopay";
            momo: "momo";
            stripe: "stripe";
            paypal: "paypal";
        }>>;
        search: z.ZodOptional<z.ZodString>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const PaymentIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdatePaymentStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodEnum<{
            pending: "pending";
            completed: "completed";
            failed: "failed";
            refunded: "refunded";
        }>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ListPaymentsAdminParams = z.infer<typeof ListPaymentsAdminQuerySchema>["query"];
//# sourceMappingURL=payment.validation.d.ts.map