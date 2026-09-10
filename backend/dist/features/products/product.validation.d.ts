import { z } from "zod";
export declare const ListProductsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodString>;
        minPrice: z.ZodOptional<z.ZodString>;
        maxPrice: z.ZodOptional<z.ZodString>;
        sort: z.ZodOptional<z.ZodEnum<{
            [x: string]: string;
        }>>;
        isActive: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ProductSlugParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const FeaturedProductsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        isFeatured: z.ZodOptional<z.ZodBoolean>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        skus: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sku: z.ZodOptional<z.ZodString>;
            price: z.ZodNumber;
            oldPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            stockQuantity: z.ZodOptional<z.ZodNumber>;
            variationDetails: z.ZodRecord<z.ZodString, z.ZodAny>;
            weightGram: z.ZodOptional<z.ZodNumber>;
            lengthCm: z.ZodOptional<z.ZodNumber>;
            widthCm: z.ZodOptional<z.ZodNumber>;
            heightCm: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateProductSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        isFeatured: z.ZodOptional<z.ZodBoolean>;
        thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodURL>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ProductIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateSkuSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        sku: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        oldPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        stockQuantity: z.ZodOptional<z.ZodNumber>;
        variationDetails: z.ZodRecord<z.ZodString, z.ZodAny>;
        weightGram: z.ZodOptional<z.ZodNumber>;
        lengthCm: z.ZodOptional<z.ZodNumber>;
        widthCm: z.ZodOptional<z.ZodNumber>;
        heightCm: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateSkuSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        sku: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        price: z.ZodOptional<z.ZodNumber>;
        oldPrice: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
        stockQuantity: z.ZodOptional<z.ZodNumber>;
        variationDetails: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        weightGram: z.ZodOptional<z.ZodNumber>;
        lengthCm: z.ZodOptional<z.ZodNumber>;
        widthCm: z.ZodOptional<z.ZodNumber>;
        heightCm: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const SkuParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateStockSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        stockQuantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateSkuImageSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        imageUrl: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateSkuImageSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
        imageId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        imageUrl: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isPrimary: z.ZodOptional<z.ZodBoolean>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const SkuImageParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        skuId: z.ZodString;
        imageId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=product.validation.d.ts.map