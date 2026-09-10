import { z } from "zod";
export declare const ListCategoriesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        parentId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"null">]>>;
        tree: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const FeaturedCategoriesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CategorySlugParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateCategorySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isFeatured: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateCategorySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        parentId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isFeatured: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CategoryIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>["body"];
export type ListCategoriesParams = z.infer<typeof ListCategoriesQuerySchema>["query"];
//# sourceMappingURL=category.validation.d.ts.map