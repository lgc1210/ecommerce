import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import warrantyClaimService from "./warranty-claim.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Customer
// ==========================================
export const listWarrantableOrderItems = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.user!.id;
		const data = await warrantyClaimService.listWarrantableOrderItems(userId);
		res.status(200).json({ data });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const createWarrantyClaim = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.user!.id;
		const claim = await warrantyClaimService.createWarrantyClaim(userId, req.body);
		res.status(201).json({ message: "Gửi yêu cầu bảo hành thành công.", data: claim });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const listMyWarrantyClaims = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.user!.id;
		const result = await warrantyClaimService.listMyWarrantyClaims(userId, req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getMyWarrantyClaimById = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.user!.id;
		const id = Number(req.params.id);
		const claim = await warrantyClaimService.getMyWarrantyClaimById(userId, id);
		res.status(200).json({ data: claim });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const cancelMyWarrantyClaim = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const userId = req.user!.id;
		const id = Number(req.params.id);
		const claim = await warrantyClaimService.cancelMyWarrantyClaim(userId, id);
		res.status(200).json({ message: "Hủy yêu cầu bảo hành thành công.", data: claim });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin (Phase 3)
// ==========================================
export const listWarrantyClaimsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await warrantyClaimService.listWarrantyClaimsAdmin(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

export const getWarrantyClaimByIdAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const claim = await warrantyClaimService.getWarrantyClaimByIdAdmin(id);
		res.status(200).json({ data: claim });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateWarrantyClaimStatus = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const staffUserId = req.user!.id;
		const id = Number(req.params.id);
		const claim = await warrantyClaimService.transitionWarrantyClaimStatus(staffUserId, id, req.body);
		res.status(200).json({ message: "Cập nhật trạng thái yêu cầu bảo hành thành công.", data: claim });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
