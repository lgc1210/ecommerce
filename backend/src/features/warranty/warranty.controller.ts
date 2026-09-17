import type { Request, Response, NextFunction } from "express";
import warrantyPolicyService from "./warranty.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Admin
// ==========================================
export const listWarrantyPolicies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await warrantyPolicyService.listWarrantyPolicies(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

export const getWarrantyPolicyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const policy = await warrantyPolicyService.getWarrantyPolicyById(id);
		res.status(200).json({ data: policy });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const createWarrantyPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const policy = await warrantyPolicyService.createWarrantyPolicy(req.body);
		res.status(201).json({ message: "Tạo chính sách bảo hành thành công.", data: policy });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateWarrantyPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const policy = await warrantyPolicyService.updateWarrantyPolicy(id, req.body);
		res.status(200).json({ message: "Cập nhật chính sách bảo hành thành công.", data: policy });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteWarrantyPolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		await warrantyPolicyService.deleteWarrantyPolicy(id);
		res.status(200).json({ message: "Xóa chính sách bảo hành thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
