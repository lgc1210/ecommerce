import type { NextFunction, Response } from "express";

// Cấu hình map ánh xạ giữa tiền tố lỗi và HTTP Status tương ứng
const ERROR_MAP: Record<string, number> = {
	Conflict: 409,
	NotFound: 404,
	Unauthorized: 401,
	Forbidden: 403,
	BadRequest: 400,
};

export function handleServiceError(error: any, res: Response, next: NextFunction) {
	const message: string = error?.message?.trim() ?? "";

	// 1. Xử lý lỗi cấu hình hệ thống trước
	if (message.startsWith("Config:")) {
		res.status(500).json({
			error: "Hệ thống chưa được cấu hình đày đủ, vui lý liên hệ quản trị vi.",
		});
		return;
	}

	// 2. Tìm tiền tố lỗi phù hợp trong ERROR_MAP
	const prefix = Object.keys(ERROR_MAP).find((p) => message.startsWith(p));

	if (prefix) {
		const statusCode = ERROR_MAP[prefix];
		const cleanMessage = message.slice(prefix.length).trim();

		res.status(statusCode!).json({ error: cleanMessage });
		return;
	}

	// 3. Chuyển tiếp các lỗi không xác định cho middleware xử lý lỗi mặc định của Express
	next(error);
}
