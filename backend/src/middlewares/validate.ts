import type { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate = (schema: ZodObject<any>) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			// Ghi kết quả ĐÃ validate (default/coerce/strip field lạ đã áp dụng) ngược lại vào
			// request, để controller/service phía sau luôn thao tác trên dữ liệu đã qua kiểm tra —
			// trước đây kết quả này bị bỏ đi, nên field lạ/không hợp lệ trong req.body gốc vẫn lọt
			// xuống service (vd. cartItems thiếu productSkuId gây crash ở prisma).
			// req.query là getter-only ở Express 5 (không gán đè được cả object), nên mutate
			// in-place bằng Object.assign thay vì gán lại req.query = ...
			req.body = parsed.body;
			Object.assign(req.query, parsed.query);
			Object.assign(req.params, parsed.params);

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				res.status(400).json({
					error: "Validation Failed",
					details: error.issues.map((err) => ({ field: err.path.join("."), message: err.message })),
				});
				return;
			}
			next(error);
		}
	};
};
