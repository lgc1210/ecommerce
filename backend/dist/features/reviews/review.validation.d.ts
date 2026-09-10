import { z } from "zod";
export declare const ListReviewsByProductQuerySchema: z.ZodObject<{
    params: z.ZodObject<{
        productId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodString>;
        sort: z.ZodOptional<z.ZodEnum<{
            newest: "newest";
            oldest: "oldest";
            highest: "highest";
            lowest: "lowest";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListMyReviewsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        orderItemId: z.ZodNumber;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateReviewSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        rating: z.ZodOptional<z.ZodNumber>;
        comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ReviewIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListReviewsAdminQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        productId: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
        rating: z.ZodOptional<z.ZodString>;
        isVisible: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ModerateReviewSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateReviewReplySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        replyContent: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateReviewReplySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        replyContent: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>["body"];
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>["body"];
export type ModerateReviewInput = z.infer<typeof ModerateReviewSchema>["body"];
export type CreateReviewReplyInput = z.infer<typeof CreateReviewReplySchema>["body"];
export type ListReviewsByProductParams = z.infer<typeof ListReviewsByProductQuerySchema>["query"];
export type ListMyReviewsParams = z.infer<typeof ListMyReviewsQuerySchema>["query"];
export type ListReviewsAdminParams = z.infer<typeof ListReviewsAdminQuerySchema>["query"];
//# sourceMappingURL=review.validation.d.ts.map