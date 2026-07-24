import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/uploads (ngang hàng với /src, /prisma...) — thư mục vật lý lưu file upload,
// được serve tĩnh qua express.static ở app.ts (xem UPLOAD_ROOT bên dưới).
export const UPLOAD_ROOT = path.resolve(__dirname, "../../../uploads");
export const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_ROOT, "products");

if (!fs.existsSync(PRODUCT_UPLOAD_DIR)) {
	fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
	filename: (_req, file, cb) => {
		// Tên file ngẫu nhiên, không phụ thuộc tên gốc (tránh trùng lặp / ký tự không hợp lệ)
		const ext = path.extname(file.originalname).toLowerCase();
		const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
		cb(null, uniqueName);
	},
});

const uploadSingleImage = multer({
	storage,
	limits: { fileSize: MAX_FILE_SIZE_BYTES },
	fileFilter: (_req, file, cb) => {
		if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
			cb(new Error("BadRequest: Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF."));
			return;
		}
		cb(null, true);
	},
}).single("image");

/**
 * Bọc middleware của multer lại để trả lỗi theo đúng format JSON nhất quán với
 * phần còn lại của API (thay vì để lỗi rơi xuống default error handler của Express).
 */
export const uploadProductImageMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	uploadSingleImage(req, res, (err: unknown) => {
		if (!err) {
			next();
			return;
		}

		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				res.status(400).json({ error: `Kích thước file vượt quá giới hạn cho phép (tối đa ${MAX_FILE_SIZE_MB}MB).` });
				return;
			}
			res.status(400).json({ error: "Tải file lên thất bại. Vui lòng thử lại." });
			return;
		}

		const message = err instanceof Error ? err.message : "Tải file lên thất bại.";
		if (message.startsWith("BadRequest:")) {
			res.status(400).json({ error: message.replace("BadRequest:", "").trim() });
			return;
		}

		next(err);
	});
};
