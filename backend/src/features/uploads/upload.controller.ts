import type { Request, Response, NextFunction } from "express";

/**
 * Trả về URL tuyệt đối của file vừa upload (đã được multer lưu vào PRODUCT_UPLOAD_DIR
 * ở bước middleware trước đó). URL này dùng trực tiếp cho:
 * - Product.thumbnailUrl (CreateProductSchema/UpdateProductSchema)
 * - ProductImage.imageUrl (CreateSkuImageSchema/UpdateSkuImageSchema) — 2 schema này yêu cầu
 *   imageUrl phải là URL hợp lệ (.url()), nên bắt buộc trả URL tuyệt đối, không phải path tương đối.
 */
export const uploadProductImage = (req: Request, res: Response, next: NextFunction): void => {
	try {
		if (!req.file) {
			res.status(400).json({ error: "Vui lòng chọn 1 file ảnh để tải lên." });
			return;
		}

		const baseUrl = `${req.protocol}://${req.get("host")}`;
		const url = `${baseUrl}/uploads/products/${req.file.filename}`;

		res.status(201).json({
			message: "Tải ảnh lên thành công.",
			data: { url, filename: req.file.filename },
		});
	} catch (error) {
		next(error);
	}
};
