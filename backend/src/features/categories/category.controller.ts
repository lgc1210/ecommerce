import type { Request, Response, NextFunction } from "express";
import categoryService from "./category.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Public
// ==========================================
export const listCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await categoryService.listCategories(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const category = await categoryService.getCategoryBySlug(req.params.slug as string);
		res.status(200).json({ data: category });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin
// ==========================================
export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const category = await categoryService.getCategoryById(id);
		res.status(200).json({ data: category });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const category = await categoryService.createCategory(req.body);
		res.status(201).json({ message: "Tạo danh mục thành công.", data: category });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const category = await categoryService.updateCategory(id, req.body);
		res.status(200).json({ message: "Cập nhật danh mục thành công.", data: category });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		await categoryService.deleteCategory(id);
		res.status(200).json({ message: "Xóa danh mục thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
