import conversationService from "./conversation.service.js";
import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Self-service: hội thoại của chính khách hàng
// ==========================================

export const getOrCreateOwnConversation = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversation = await conversationService.getOrCreateOwnConversation(req.user!.id);
		res.status(200).json({ message: "OK", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

/** CHỈ ĐỌC — không tự tạo mới (khác getOrCreateOwnConversation ở trên, dùng cho nút "Chat"). Trả `data: null` nếu khách chưa từng chat, không phải lỗi. */
export const getOwnCurrentConversation = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversation = await conversationService.getOwnCurrentConversation(req.user!.id);
		res.status(200).json({ message: "OK", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getOwnConversation = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.getOwnConversation(req.user!.id, conversationId);
		res.status(200).json({ message: "OK", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const markOwnConversationRead = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.markReadByCustomer(
			req.user!.id,
			conversationId,
			req.body.lastReadMessageId,
		);
		res.status(200).json({ message: "Đã đánh dấu đã đọc.", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Staff/quản lý: shared inbox — xem & xử lý mọi hội thoại
// ==========================================

export const listConversationsAdmin = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const result = await conversationService.listConversationsForStaff(req.query as Record<string, string>);
		res.status(200).json({
			message: "OK",
			data: result.items,
			meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getConversationAdmin = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.getConversationOrThrow(conversationId);
		res.status(200).json({ message: "OK", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const assignConversationToSelf = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.assignToSelf(conversationId, req.user!.id);
		res.status(200).json({ message: "Đã nhận xử lý hội thoại.", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateConversationStatus = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.updateStatus(conversationId, req.body.status);
		res.status(200).json({ message: "Đã cập nhật trạng thái hội thoại.", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const markStaffConversationRead = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const conversationId = Number(req.params.id);
		const conversation = await conversationService.markReadByStaff(conversationId, req.body.lastReadMessageId);
		res.status(200).json({ message: "Đã đánh dấu đã đọc.", data: conversation });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
