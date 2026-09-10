import type { Request, Response, NextFunction } from "express";
export interface TokenPayload {
    id: number;
    email: string;
    roleId: number;
}
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticateJWT: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Xác thực "tùy chọn": dùng cho route public nhưng vẫn muốn biết người gửi
 * request có đang đăng nhập hay không (vd. POST /contacts — khách vãng lai vẫn
 * gửi được, nhưng nếu đang đăng nhập thì liên hệ đó phải gắn với userId).
 * Khác với authenticateJWT: KHÔNG bao giờ trả 401/403 — thiếu token hoặc token
 * không hợp lệ/hết hạn đều được coi là "khách chưa đăng nhập" (req.user để
 * trống) thay vì chặn request.
 */
export declare const authenticateOptional: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authenticate.d.ts.map