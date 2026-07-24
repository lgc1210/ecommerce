import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import orderService from "./order.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Self-service: checkout
// ==========================================
export const checkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const order = await orderService.checkout(req.user!.id, req.body);
		res.status(201).json({ message: "Đặt hàng thành công.", data: order });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Self-service: xem & hủy đơn của chính mình
// ==========================================
export const listOwnOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await orderService.listOwnOrders(req.user!.id, req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getOwnOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.id);
		const order = await orderService.getOwnOrderById(req.user!.id, orderId);
		res.status(200).json({ data: order });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const cancelOwnOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.id);
		const order = await orderService.cancelOwnOrder(req.user!.id, orderId);
		res.status(200).json({ message: "Đã hủy đơn hàng.", data: order });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin
// ==========================================
export const listOrdersAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await orderService.listOrdersAdmin(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.id);
		const order = await orderService.getOrderById(orderId);
		res.status(200).json({ data: order });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.id);
		const order = await orderService.updateOrderStatus(orderId, req.body.status);
		res.status(200).json({ message: "Cập nhật trạng thái đơn hàng thành công.", data: order });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
