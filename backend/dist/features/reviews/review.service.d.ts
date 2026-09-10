import type { CreateReviewInput, UpdateReviewInput, ModerateReviewInput, CreateReviewReplyInput, ListReviewsByProductParams, ListMyReviewsParams, ListReviewsAdminParams } from "./review.validation.js";
declare class ReviewService {
    listReviewsByProduct(productId: number, params: ListReviewsByProductParams): Promise<{
        data: ({
            user: {
                id: number;
                name: string;
            } | null;
            reply: ({
                repliedByUser: {
                    id: number;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                reviewId: number;
                repliedBy: number;
                replyContent: string;
            }) | null;
        } & {
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            productId: number;
            orderItemId: number | null;
            rating: number;
            comment: string | null;
            isVisible: boolean;
            isRefundedTag: boolean;
            editCount: number;
            lastEditedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        summary: {
            average: number | null;
            total: number;
            breakdown: Record<1 | 2 | 5 | 4 | 3, number>;
        };
    }>;
    /** Danh sách order_item đủ điều kiện để user viết review: thuộc đơn đã "delivered", chưa từng được review. */
    listReviewableOrderItems(userId: number): Promise<({
        productSku: ({
            product: {
                id: number;
                name: string;
                slug: string;
            } | null;
            images: {
                productSkuId: number;
                sortOrder: number;
                isPrimary: boolean;
                id: number;
                createdAt: Date | null;
                imageUrl: string;
                altText: string | null;
            }[];
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
        }) | null;
        order: {
            id: number;
            createdAt: Date | null;
            orderNumber: string;
            deliveredAt: Date | null;
        };
    } & {
        productSkuId: number | null;
        quantity: number;
        id: number;
        orderId: number;
        priceAtPurchase: import("@prisma/client-runtime-utils").Decimal;
        variationSnapshot: import("../../generated/prisma/runtime/client.js").JsonValue | null;
    })[]>;
    /** Danh sách review CHÍNH user hiện tại đã viết (mọi trạng thái isVisible) — dùng cho tab "Đánh giá của tôi", để sửa/xóa. */
    listMyReviews(userId: number, params: ListMyReviewsParams): Promise<{
        data: ({
            product: {
                id: number;
                name: string;
                slug: string;
            };
            reply: ({
                repliedByUser: {
                    id: number;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                reviewId: number;
                repliedBy: number;
                replyContent: string;
            }) | null;
        } & {
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            productId: number;
            orderItemId: number | null;
            rating: number;
            comment: string | null;
            isVisible: boolean;
            isRefundedTag: boolean;
            editCount: number;
            lastEditedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createReview(userId: number, data: CreateReviewInput): Promise<{
        user: {
            id: number;
            name: string;
        } | null;
        reply: ({
            repliedByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            reviewId: number;
            repliedBy: number;
            replyContent: string;
        }) | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number;
        orderItemId: number | null;
        rating: number;
        comment: string | null;
        isVisible: boolean;
        isRefundedTag: boolean;
        editCount: number;
        lastEditedAt: Date | null;
    }>;
    updateReview(userId: number, reviewId: number, data: UpdateReviewInput): Promise<{
        user: {
            id: number;
            name: string;
        } | null;
        reply: ({
            repliedByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            reviewId: number;
            repliedBy: number;
            replyContent: string;
        }) | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number;
        orderItemId: number | null;
        rating: number;
        comment: string | null;
        isVisible: boolean;
        isRefundedTag: boolean;
        editCount: number;
        lastEditedAt: Date | null;
    }>;
    deleteReview(userId: number, reviewId: number): Promise<void>;
    listReviewsAdmin(params: ListReviewsAdminParams): Promise<{
        data: ({
            user: {
                id: number;
                name: string;
            } | null;
            product: {
                id: number;
                name: string;
                slug: string;
            };
            reply: ({
                repliedByUser: {
                    id: number;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                reviewId: number;
                repliedBy: number;
                replyContent: string;
            }) | null;
            moderationLogs: ({
                actionByUser: {
                    id: number;
                    name: string;
                };
            } & {
                id: number;
                createdAt: Date | null;
                reviewId: number;
                actionByUserId: number;
                isHidden: boolean;
                reason: string | null;
            })[];
        } & {
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            productId: number;
            orderItemId: number | null;
            rating: number;
            comment: string | null;
            isVisible: boolean;
            isRefundedTag: boolean;
            editCount: number;
            lastEditedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Kiểm duyệt viên ẩn review vi phạm (spam, ngôn từ không phù hợp...) — KHÔNG sửa nội dung/rating
     * gốc của khách, chỉ chuyển isVisible=false và ghi lại lịch sử vào ReviewModerationLog để đối soát.
     */
    hideReview(actionByUserId: number, reviewId: number, data: ModerateReviewInput): Promise<{
        user: {
            id: number;
            name: string;
        } | null;
        product: {
            id: number;
            name: string;
            slug: string;
        };
        reply: ({
            repliedByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            reviewId: number;
            repliedBy: number;
            replyContent: string;
        }) | null;
        moderationLogs: ({
            actionByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            reviewId: number;
            actionByUserId: number;
            isHidden: boolean;
            reason: string | null;
        })[];
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number;
        orderItemId: number | null;
        rating: number;
        comment: string | null;
        isVisible: boolean;
        isRefundedTag: boolean;
        editCount: number;
        lastEditedAt: Date | null;
    }>;
    /** Kiểm duyệt viên hiện lại review đã bị ẩn trước đó (vd: xử lý oan, khiếu nại thành công). */
    unhideReview(actionByUserId: number, reviewId: number, data: ModerateReviewInput): Promise<{
        user: {
            id: number;
            name: string;
        } | null;
        product: {
            id: number;
            name: string;
            slug: string;
        };
        reply: ({
            repliedByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            reviewId: number;
            repliedBy: number;
            replyContent: string;
        }) | null;
        moderationLogs: ({
            actionByUser: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date | null;
            reviewId: number;
            actionByUserId: number;
            isHidden: boolean;
            reason: string | null;
        })[];
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number;
        orderItemId: number | null;
        rating: number;
        comment: string | null;
        isVisible: boolean;
        isRefundedTag: boolean;
        editCount: number;
        lastEditedAt: Date | null;
    }>;
    /** Kiểm duyệt viên xóa hẳn review (vd: spam nghiêm trọng), không giới hạn theo chủ sở hữu. */
    adminDeleteReview(reviewId: number): Promise<void>;
    createReply(repliedBy: number, reviewId: number, data: CreateReviewReplyInput): Promise<{
        repliedByUser: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        reviewId: number;
        repliedBy: number;
        replyContent: string;
    }>;
    updateReply(reviewId: number, data: CreateReviewReplyInput): Promise<{
        repliedByUser: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        reviewId: number;
        repliedBy: number;
        replyContent: string;
    }>;
    deleteReply(reviewId: number): Promise<void>;
    private applyModeration;
    /** Xóa review kèm các bản ghi phụ thuộc (reply, moderation logs) trong 1 transaction để không vướng FK constraint. */
    private deleteReviewCascade;
    private resolveSortOrder;
    private getReviewOrThrow;
}
declare const _default: ReviewService;
export default _default;
//# sourceMappingURL=review.service.d.ts.map