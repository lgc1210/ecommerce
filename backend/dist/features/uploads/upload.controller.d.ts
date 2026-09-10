import type { Request, Response, NextFunction } from "express";
/**
 * Trả về URL tuyệt đối của file vừa upload (đã được multer lưu vào PRODUCT_UPLOAD_DIR
 * ở bước middleware trước đó). URL này dùng trực tiếp cho:
 * - Product.thumbnailUrl (CreateProductSchema/UpdateProductSchema)
 * - ProductImage.imageUrl (CreateSkuImageSchema/UpdateSkuImageSchema) — 2 schema này yêu cầu
 *   imageUrl phải là URL hợp lệ (.url()), nên bắt buộc trả URL tuyệt đối, không phải path tương đối.
 */
export declare const uploadProductImage: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.controller.d.ts.map