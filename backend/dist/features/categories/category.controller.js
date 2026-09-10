import categoryService from "./category.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
// ==========================================
// Public
// ==========================================
export const listCategories = async (req, res, next) => {
    try {
        const result = await categoryService.listCategories(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const getFeaturedCategories = async (req, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const result = await categoryService.getFeaturedCategories(limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug);
        res.status(200).json({ data: category });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Admin
// ==========================================
export const getCategoryById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const category = await categoryService.getCategoryById(id);
        res.status(200).json({ data: category });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({ message: "Tạo danh mục thành công.", data: category });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const updateCategory = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const category = await categoryService.updateCategory(id, req.body);
        res.status(200).json({ message: "Cập nhật danh mục thành công.", data: category });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const deleteCategory = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await categoryService.deleteCategory(id);
        res.status(200).json({ message: "Xóa danh mục thành công." });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=category.controller.js.map