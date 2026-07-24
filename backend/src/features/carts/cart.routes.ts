import { Router } from "express";
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from "./cart.controller.js";
import { validate } from "../../middlewares/validate.js";
import { AddCartItemSchema, UpdateCartItemSchema, CartItemParamSchema } from "./cart.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Self-service (yêu cầu đăng nhập + permission "cart:manage")
// Giỏ hàng luôn thao tác trên chính user đang đăng nhập, không có route admin.
// ==========================================
router.get("/", authenticateJWT, requirePermission("cart:manage"), getCart);
router.post("/items", authenticateJWT, requirePermission("cart:manage"), validate(AddCartItemSchema), addCartItem);
router.patch("/items/:itemId", authenticateJWT, requirePermission("cart:manage"), validate(UpdateCartItemSchema), updateCartItem);
router.delete("/items/:itemId", authenticateJWT, requirePermission("cart:manage"), validate(CartItemParamSchema), removeCartItem);
router.delete("/", authenticateJWT, requirePermission("cart:manage"), clearCart);

export default router;
