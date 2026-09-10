import { z } from "zod";
export declare const AddCartItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        productSkuId: z.ZodNumber;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateCartItemSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        quantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CartItemParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AddCartItemInput = z.infer<typeof AddCartItemSchema>["body"];
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>["body"];
export type CartItemParam = z.infer<typeof CartItemParamSchema>["params"];
//# sourceMappingURL=cart.validation.d.ts.map