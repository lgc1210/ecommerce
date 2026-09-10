import type { AddCartItemInput } from "./cart.validation.js";
declare class CartService {
    getCart(userId: number): Promise<{
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        items: ({
            productSku: {
                product: {
                    id: number;
                    name: string;
                    slug: string;
                    isActive: boolean;
                    thumbnailUrl: string | null;
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
            };
        } & {
            productSkuId: number;
            quantity: number;
            id: number;
            cartId: number;
        })[];
        id: number;
        userId: number;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    addItem(userId: number, data: AddCartItemInput): Promise<{
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        items: ({
            productSku: {
                product: {
                    id: number;
                    name: string;
                    slug: string;
                    isActive: boolean;
                    thumbnailUrl: string | null;
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
            };
        } & {
            productSkuId: number;
            quantity: number;
            id: number;
            cartId: number;
        })[];
        id: number;
        userId: number;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updateItemQuantity(userId: number, itemId: number, quantity: number): Promise<{
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        items: ({
            productSku: {
                product: {
                    id: number;
                    name: string;
                    slug: string;
                    isActive: boolean;
                    thumbnailUrl: string | null;
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
            };
        } & {
            productSkuId: number;
            quantity: number;
            id: number;
            cartId: number;
        })[];
        id: number;
        userId: number;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    removeItem(userId: number, itemId: number): Promise<{
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        items: ({
            productSku: {
                product: {
                    id: number;
                    name: string;
                    slug: string;
                    isActive: boolean;
                    thumbnailUrl: string | null;
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
            };
        } & {
            productSkuId: number;
            quantity: number;
            id: number;
            cartId: number;
        })[];
        id: number;
        userId: number;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    clearCart(userId: number): Promise<void>;
    mergeLocalCartToDb(userId: number, pendingCartItems: AddCartItemInput[]): Promise<{
        cart: {
            totalItems: number;
            totalQuantity: number;
            subtotal: number;
            items: ({
                productSku: {
                    product: {
                        id: number;
                        name: string;
                        slug: string;
                        isActive: boolean;
                        thumbnailUrl: string | null;
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
                };
            } & {
                productSkuId: number;
                quantity: number;
                id: number;
                cartId: number;
            })[];
            id: number;
            userId: number;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        skippedItems: {
            productSkuId: number;
            reason: "not_found" | "out_of_stock";
        }[];
    }>;
    /** Mỗi user chỉ có 1 giỏ hàng (Cart.userId là unique) -> tự tạo nếu chưa có, tránh phải seed thủ công */
    private getOrCreateCart;
    private assertSkuAvailable;
    /** Đảm bảo cart item tồn tại và thuộc đúng giỏ hàng của user đang thao tác (owned data check) */
    private getOwnedItemOrThrow;
}
declare const _default: CartService;
export default _default;
//# sourceMappingURL=cart.service.d.ts.map