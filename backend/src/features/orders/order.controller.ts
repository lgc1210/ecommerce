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

export const previewShippingFee = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const result = await orderService.previewShippingFee(req.user!.id, req.body.shippingAddressId);
		res.status(200).json({ data: result });
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

// ==========================================
// Webhook: GHN gọi ngược về khi trạng thái vận chuyển thay đổi
// ==========================================
/**
 * LUÔN trả 200 (kể cả khi có lỗi xử lý nội bộ) — theo tài liệu GHN, response khác 200 sẽ khiến
 * GHN bắn lại callback này tối đa 10 lần, mỗi lần cách nhau 5 giây; lỗi xử lý phía mình (đơn
 * không tìm thấy, DB lỗi...) không phải lỗi của GHN nên không nên để GHN retry vô ích.
 */
export const receiveGhnWebhook = async (req: Request, res: Response): Promise<void> => {
	try {
		await orderService.syncFromGhnWebhook(req.body.OrderCode, req.body.Status);
	} catch (error) {
		console.error("[GHN webhook] Xử lý callback thất bại:", error);
	}
	res.status(200).json({ message: "OK" });
};
