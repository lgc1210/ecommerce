import type { Response, NextFunction } from "express";
import cartService from "./cart.service.js";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Self-service: xem giỏ hàng
// ==========================================
export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const cart = await cartService.getCart(req.user!.id);
		res.status(200).json({ data: cart });
	} catch (error) {
		next(error);
	}
};

// ==========================================
// Self-service: thao tác trên item
// ==========================================
export const addCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const cart = await cartService.addItem(req.user!.id, req.body);
		res.status(201).json({ message: "Đã thêm sản phẩm vào giỏ hàng.", data: cart });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const itemId = Number(req.params.itemId);
		const cart = await cartService.updateItemQuantity(req.user!.id, itemId, req.body.quantity);
		res.status(200).json({ message: "Cập nhật số lượng thành công.", data: cart });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const itemId = Number(req.params.itemId);
		const cart = await cartService.removeItem(req.user!.id, itemId);
		res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng.", data: cart });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		await cartService.clearCart(req.user!.id);
		res.status(200).json({ message: "Đã xóa toàn bộ giỏ hàng." });
	} catch (error) {
		next(error);
	}
};
