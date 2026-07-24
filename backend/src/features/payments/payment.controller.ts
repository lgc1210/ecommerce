import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import paymentService from "./payment.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Self-service: xem & xác nhận thanh toán đơn của chính mình
// ==========================================
export const getOwnPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.orderId);
		const payment = await paymentService.getOwnPayment(req.user!.id, orderId);
		res.status(200).json({ data: payment });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const confirmOwnPayment = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const orderId = Number(req.params.orderId);
		const payment = await paymentService.confirmOwnPayment(req.user!.id, orderId, req.body.transactionId);
		res.status(200).json({ message: "Xác nhận thanh toán thành công.", data: payment });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin
// ==========================================
export const listPaymentsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await paymentService.listPaymentsAdmin(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const payment = await paymentService.getPaymentById(id);
		res.status(200).json({ data: payment });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const payment = await paymentService.updatePaymentStatus(id, req.body.status, req.body.transactionId);
		res.status(200).json({ message: "Cập nhật trạng thái thanh toán thành công.", data: payment });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
