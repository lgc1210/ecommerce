import { z } from "zod";
export declare const NotificationPayloadSchema: z.ZodObject<{
    userId: z.ZodNumber;
    type: z.ZodEnum<{
        review: "review";
        order: "order";
        payment: "payment";
        contact: "contact";
        promotion: "promotion";
        stock: "stock";
        system: "system";
    }>;
    title: z.ZodString;
    message: z.ZodString;
    actionUrl: z.ZodOptional<z.ZodString>;
    referenceId: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ListOwnNotificationsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        isRead: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            review: "review";
            order: "order";
            payment: "payment";
            contact: "contact";
            promotion: "promotion";
            stock: "stock";
            system: "system";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const NotificationIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const BroadcastNotificationSchema: z.ZodObject<{
    body: z.ZodObject<{
        type: z.ZodEnum<{
            promotion: "promotion";
            system: "system";
        }>;
        title: z.ZodString;
        message: z.ZodString;
        actionUrl: z.ZodOptional<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;
export type BroadcastNotificationInput = z.infer<typeof BroadcastNotificationSchema>["body"];
export type ListOwnNotificationsParams = z.infer<typeof ListOwnNotificationsQuerySchema>["query"];
//# sourceMappingURL=notification.validation.d.ts.map