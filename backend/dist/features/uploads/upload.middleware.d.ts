import type { Request, Response, NextFunction } from "express";
export declare const UPLOAD_ROOT: string;
export declare const PRODUCT_UPLOAD_DIR: string;
export declare const MAX_FILE_SIZE_MB = 5;
/**
 * Bọc middleware của multer lại để trả lỗi theo đúng format JSON nhất quán với
 * phần còn lại của API (thay vì để lỗi rơi xuống default error handler của Express).
 */
export declare const uploadProductImageMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.middleware.d.ts.map