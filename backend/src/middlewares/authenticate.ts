import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/dotenv.js";

export interface TokenPayload {
	id: number;
	email: string;
	roleId: number;
}

export interface AuthenticatedRequest extends Request {
	user?: TokenPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	// 1. Extract the token directly from your secure cookie storage layout registry
	const token = req.cookies?.accessToken;

	if (!token) {
		res.status(401).json({ error: "Access Denied: Authentication session token missing or expired." });
		return;
	}

	try {
		// 2. Safely verify and bind your strict TypeScript types
		const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;

		req.user = decoded; // Success: Passes user context to downstream handlers
		next();
	} catch (error) {
		res.status(403).json({ error: "Forbidden: Your session token is invalid or corrupted." });
	}
};

/**
 * Xác thực "tùy chọn": dùng cho route public nhưng vẫn muốn biết người gửi
 * request có đang đăng nhập hay không (vd. POST /contacts — khách vãng lai vẫn
 * gửi được, nhưng nếu đang đăng nhập thì liên hệ đó phải gắn với userId).
 * Khác với authenticateJWT: KHÔNG bao giờ trả 401/403 — thiếu token hoặc token
 * không hợp lệ/hết hạn đều được coi là "khách chưa đăng nhập" (req.user để
 * trống) thay vì chặn request.
 */

export const authenticateOptional = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	const token = req.cookies?.accessToken;

	if (!token) {
		next();
		return;
	}

	try {
		req.user = jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
	} catch (error) {
		// Token hết hạn/không hợp lệ -> coi như khách vãng lai, không chặn request.
	}

	next();
};
