import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import notificationService from "./notification.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Customer (self-service)
// ==========================================
export const listOwnNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const result = await notificationService.listOwn(userId, req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const id = Number(req.params.id);
		const notification = await notificationService.markAsRead(userId, id);
		res.status(200).json({ message: "Đã đánh dấu đã đọc.", data: notification });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		await notificationService.markAllAsRead(userId);
		res.status(200).json({ message: "Đã đánh dấu tất cả đã đọc." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteOwnNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const id = Number(req.params.id);
		await notificationService.deleteOwn(userId, id);
		res.status(200).json({ message: "Đã xóa thông báo." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteAllReadNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user!.id;
		const { deletedCount } = await notificationService.deleteAllRead(userId);
		res.status(200).json({ message: `Đã xóa ${deletedCount} thông báo đã đọc.`, deletedCount });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin: broadcast thông báo hệ thống/khuyến mãi
// ==========================================
export const broadcastNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { sentCount } = await notificationService.broadcastToAllCustomers(req.body);
		res.status(201).json({ message: `Đã gửi thông báo tới ${sentCount} khách hàng.`, sentCount });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
