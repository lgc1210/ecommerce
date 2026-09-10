import type { Prisma } from "../../generated/prisma/index.js";
import type { CreateProductInput, ListProductsParams, SkuInput, UpdateProductInput, UpdateSkuInput } from "./product.type.js";
declare class ProductService {
    listProducts(params: ListProductsParams): Promise<{
        data: ({
            category: {
                id: number;
                name: string;
                slug: string;
            } | null;
            skus: {
                id: number;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
            }[];
            _count: {
                reviews: number;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            categoryId: number | null;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            isFeatured: boolean;
            warrantyPolicyId: number | null;
            thumbnailUrl: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProductBySlug(slug: string, options: {
        publicOnly: boolean;
    }): Promise<{
        averageRating: number | null;
        related: ({
            category: {
                id: number;
                name: string;
                slug: string;
            } | null;
            skus: {
                id: number;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
            }[];
            _count: {
                reviews: number;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            categoryId: number | null;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            isFeatured: boolean;
            warrantyPolicyId: number | null;
            thumbnailUrl: string | null;
        })[];
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        skus: ({
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
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            stockQuantity: number;
            variationDetails: Prisma.JsonValue;
            weightGram: number;
            lengthCm: number;
            widthCm: number;
            heightCm: number;
        })[];
        reviews: ({
            user: {
                id: number;
                name: string;
            } | null;
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
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        categoryId: number | null;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        warrantyPolicyId: number | null;
        thumbnailUrl: string | null;
    }>;
    /** Sản phẩm nổi bật (isFeatured=true, admin đánh dấu), dùng cho carousel ở trang chủ. Chỉ lấy sản phẩm đang active. */
    getFeaturedProducts(limit?: number): Promise<{
        data: ({
            category: {
                id: number;
                name: string;
                slug: string;
            } | null;
            skus: {
                id: number;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
            }[];
            _count: {
                reviews: number;
            };
        } & {
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            categoryId: number | null;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            isFeatured: boolean;
            warrantyPolicyId: number | null;
            thumbnailUrl: string | null;
        })[];
    }>;
    getProductById(id: number): Promise<{
        averageRating: number | null;
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        skus: ({
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
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            stockQuantity: number;
            variationDetails: Prisma.JsonValue;
            weightGram: number;
            lengthCm: number;
            widthCm: number;
            heightCm: number;
        })[];
        reviews: ({
            user: {
                id: number;
                name: string;
            } | null;
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
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        categoryId: number | null;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        warrantyPolicyId: number | null;
        thumbnailUrl: string | null;
    }>;
    createProduct(data: CreateProductInput): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        skus: ({
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
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            stockQuantity: number;
            variationDetails: Prisma.JsonValue;
            weightGram: number;
            lengthCm: number;
            widthCm: number;
            heightCm: number;
        })[];
        reviews: ({
            user: {
                id: number;
                name: string;
            } | null;
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
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        categoryId: number | null;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        warrantyPolicyId: number | null;
        thumbnailUrl: string | null;
    }>;
    updateProduct(id: number, data: UpdateProductInput): Promise<{
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        skus: ({
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
            price: Prisma.Decimal;
            oldPrice: Prisma.Decimal | null;
            stockQuantity: number;
            variationDetails: Prisma.JsonValue;
            weightGram: number;
            lengthCm: number;
            widthCm: number;
            heightCm: number;
        })[];
        reviews: ({
            user: {
                id: number;
                name: string;
            } | null;
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
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        categoryId: number | null;
        name: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        isFeatured: boolean;
        warrantyPolicyId: number | null;
        thumbnailUrl: string | null;
    }>;
    deleteProduct(id: number): Promise<void>;
    createSku(productId: number, data: SkuInput): Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number | null;
        sku: string;
        price: Prisma.Decimal;
        oldPrice: Prisma.Decimal | null;
        stockQuantity: number;
        variationDetails: Prisma.JsonValue;
        weightGram: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    }>;
    updateSku(productId: number, skuId: number, data: UpdateSkuInput): Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number | null;
        sku: string;
        price: Prisma.Decimal;
        oldPrice: Prisma.Decimal | null;
        stockQuantity: number;
        variationDetails: Prisma.JsonValue;
        weightGram: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    }>;
    updateSkuStock(productId: number, skuId: number, stockQuantity: number): Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        productId: number | null;
        sku: string;
        price: Prisma.Decimal;
        oldPrice: Prisma.Decimal | null;
        stockQuantity: number;
        variationDetails: Prisma.JsonValue;
        weightGram: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    }>;
    deleteSku(productId: number, skuId: number): Promise<void>;
    /** Thêm ảnh cho 1 SKU. Ảnh đầu tiên của SKU đó luôn tự động là ảnh đại diện (isPrimary), bất kể input truyền vào. */
    addSkuImage(productId: number, skuId: number, data: {
        imageUrl: string;
        altText?: string;
        isPrimary?: boolean;
        sortOrder?: number;
    }): Promise<{
        productSkuId: number;
        sortOrder: number;
        isPrimary: boolean;
        id: number;
        createdAt: Date | null;
        imageUrl: string;
        altText: string | null;
    }>;
    updateSkuImage(productId: number, skuId: number, imageId: number, data: {
        imageUrl?: string;
        altText?: string | null;
        isPrimary?: boolean;
        sortOrder?: number;
    }): Promise<{
        productSkuId: number;
        sortOrder: number;
        isPrimary: boolean;
        id: number;
        createdAt: Date | null;
        imageUrl: string;
        altText: string | null;
    }>;
    /** Xóa ảnh của SKU. Nếu ảnh bị xóa là ảnh đại diện, tự động gán ảnh còn lại (theo sortOrder) của cùng SKU làm ảnh đại diện mới. */
    deleteSkuImage(productId: number, skuId: number, imageId: number): Promise<void>;
    /**
     * Tìm sản phẩm liên quan tới `productId`, dùng để nhúng vào response của getProductBySlug.
     * Chỉ lấy sản phẩm cùng danh mục (categoryId), đang active, sắp xếp theo mới nhất. Nếu sản phẩm
     * không thuộc danh mục nào, hoặc danh mục đó không còn sản phẩm active nào khác, trả về mảng rỗng
     * (không lấp đầy bằng sản phẩm khác danh mục).
     */
    private findRelatedProducts;
    private resolveSortOrder;
    /**
     * Sắp xếp + phân trang sản phẩm theo giá thấp nhất (min price) — dùng riêng cho sort=price_asc/
     * price_desc vì Prisma không hỗ trợ orderBy theo MIN/MAX của quan hệ 1-nhiều ở findMany (xem
     * listProducts). Sản phẩm chưa có SKU nào (không có giá) luôn bị xếp CUỐI, bất kể tăng/giảm dần,
     * vì không có gì để so sánh.
     */
    private resolvePriceSortedProducts;
    private assertCategoryExists;
    private assertProductExists;
    private assertSkuBelongsToProduct;
    private assertImageBelongsToSku;
    /**
     * Đồng bộ lại `product.thumbnailUrl` (denormalized cache dùng cho trang danh sách, tránh phải join
     * skus+images cho mỗi sản phẩm). Quy ước "ảnh mặc định" = ảnh primary (hoặc sortOrder nhỏ nhất nếu
     * chưa có primary) của SKU có id nhỏ nhất trong số các SKU CÒN ảnh. Nếu sản phẩm không còn ảnh nào
     * ở bất kỳ SKU nào, thumbnailUrl được đặt về null.
     * Luôn gọi hàm này (trong cùng transaction) sau khi ảnh của 1 SKU được thêm/sửa/xóa.
     */
    private syncProductThumbnail;
    /** Kiểm tra danh sách mã SKU chưa bị trùng trong hệ thống (unique toàn cục) */
    private assertSkuCodesAvailable;
    /** Sinh slug duy nhất từ tên/slug đề xuất, tự thêm hậu tố -2, -3... nếu bị trùng */
    private resolveUniqueSlug;
    /**
     * Sinh mã SKU duy nhất từ mã gợi ý (vd: "ATCB-DEN-M"), tự thêm hậu tố -2, -3... nếu bị trùng.
     * `reservedCodes` dùng để tránh trùng ngay trong cùng 1 request (khi tạo nhiều SKU cùng lúc).
     */
    private resolveUniqueSkuCode;
}
declare const _default: ProductService;
export default _default;
//# sourceMappingURL=product.service.d.ts.map