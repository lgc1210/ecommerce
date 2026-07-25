import type { Request, Response, NextFunction } from "express";
import productService from "./product.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Public
// ==========================================
export const listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await productService.listProducts(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const product = await productService.getProductBySlug(req.params.slug as string, { publicOnly: true });
		res.status(200).json({ data: product });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin - Product
// ==========================================
export const listProductsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await productService.listProducts(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const product = await productService.getProductById(id);
		res.status(200).json({ data: product });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const product = await productService.createProduct(req.body);
		res.status(201).json({ message: "Tạo sản phẩm thành công.", data: product });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const product = await productService.updateProduct(id, req.body);
		res.status(200).json({ message: "Cập nhật sản phẩm thành công.", data: product });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		await productService.deleteProduct(id);
		res.status(200).json({ message: "Xóa sản phẩm thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin - Product SKU (biến thể)
// ==========================================
export const createSku = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const sku = await productService.createSku(productId, req.body);
		res.status(201).json({ message: "Tạo biến thể (SKU) thành công.", data: sku });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateSku = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		const sku = await productService.updateSku(productId, skuId, req.body);
		res.status(200).json({ message: "Cập nhật biến thể (SKU) thành công.", data: sku });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateSkuStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		const sku = await productService.updateSkuStock(productId, skuId, req.body.stockQuantity);
		res.status(200).json({ message: "Cập nhật tồn kho thành công.", data: sku });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteSku = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		await productService.deleteSku(productId, skuId);
		res.status(200).json({ message: "Xóa biến thể (SKU) thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin - Product SKU Images (ảnh theo từng biến thể)
// ==========================================
export const addSkuImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		const image = await productService.addSkuImage(productId, skuId, req.body);
		res.status(201).json({ message: "Đã thêm ảnh cho biến thể.", data: image });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateSkuImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		const imageId = Number(req.params.imageId);
		const image = await productService.updateSkuImage(productId, skuId, imageId, req.body);
		res.status(200).json({ message: "Cập nhật ảnh biến thể thành công.", data: image });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteSkuImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const productId = Number(req.params.id);
		const skuId = Number(req.params.skuId);
		const imageId = Number(req.params.imageId);
		await productService.deleteSkuImage(productId, skuId, imageId);
		res.status(200).json({ message: "Đã xóa ảnh biến thể." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
