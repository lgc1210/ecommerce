import { z } from "zod";
import { numericIdString } from "../../shared/validation.js";

// ==========================================
// Self-service: cart items
// ==========================================
export const AddCartItemSchema = z.object({
	body: z.object({
		productSkuId: z.number().int().positive({ message: "productSkuId không hợp lệ." }),
		quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0." }).default(1),
	}),
});

export const UpdateCartItemSchema = z.object({
	params: z.object({ itemId: numericIdString }),
	body: z.object({
		quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0." }),
	}),
});

export const CartItemParamSchema = z.object({
	params: z.object({ itemId: numericIdString }),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>["body"];
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>["body"];
export type CartItemParam = z.infer<typeof CartItemParamSchema>["params"];
