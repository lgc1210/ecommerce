import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env } from "../../config/dotenv.js";
import type { TokenPayload } from "../../middlewares/authenticate.js";

// ==========================================
// Token lifetimes
// ==========================================
// Access token: short-lived, sent on every request via the "accessToken" cookie.
// Refresh token: long-lived, only used to mint new access tokens; its raw JWT string
// is also persisted in the `refresh_tokens` table so it can be revoked (logout,
// password reset, "log out of all devices") even before its natural JWT expiry.
export const ACCESS_TOKEN_EXPIRES_IN: NonNullable<SignOptions["expiresIn"]> = "15m";
export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

export const REFRESH_TOKEN_EXPIRES_IN: NonNullable<SignOptions["expiresIn"]> = "7d";
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// ==========================================
// OTP settings
// ==========================================
export const OTP_LENGTH = 6;
export const OTP_EXPIRES_IN_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

/** Sinh mã OTP dạng số, độ dài OTP_LENGTH (mặc định 6 chữ số, ví dụ "042591") */
export function generateOtpCode(): string {
	const min = Math.pow(10, OTP_LENGTH - 1);
	const max = Math.pow(10, OTP_LENGTH) - 1;
	const code = Math.floor(min + Math.random() * (max - min + 1));
	return code.toString();
}

export function getOtpExpiryDate(): Date {
	return new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);
}

// ==========================================
// JWT helpers
// ==========================================
export function signAccessToken(payload: TokenPayload): string {
	return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function signRefreshToken(payload: TokenPayload): string {
	return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): TokenPayload {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as TokenPayload;
}

// ==========================================
// Cookie helpers
// ==========================================
// httpOnly: chặn JS phía client đọc cookie (giảm rủi ro XSS đánh cắp token)
// secure: chỉ gửi qua HTTPS khi ở production
// sameSite: "lax" đủ an toàn cho CSRF trong khi vẫn cho phép redirect từ OAuth provider
const baseCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	path: "/",
};

export function getAccessTokenCookieOptions(): CookieOptions {
	return { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE_MS };
}

export function getRefreshTokenCookieOptions(): CookieOptions {
	return { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE_MS };
}

// Lọc các field nội bộ không nên trả về client:
// - passwordHash: hiển nhiên không bao giờ được lộ.
// - providerId: là Google "sub" — 1 định danh vĩnh viễn, duy nhất, gắn với đúng 1 tài
//   khoản Google, giống nhau trên mọi service khác cũng dùng Google login. Không phải
//   bí mật (không dùng để giả mạo đăng nhập được), nhưng nếu lộ ra (đặc biệt là admin
//   xem được providerId của user khác qua API danh sách user) thì có thể bị dùng để
//   liên kết danh tính người dùng giữa các hệ thống khác nhau (correlation/fingerprinting).
//   Backend vẫn lưu providerId trong DB để phục vụ việc liên kết tài khoản (linking) khi
//   đăng nhập Google, chỉ là không cần thiết phải trả nó ra ngoài cho bất kỳ client nào.
export function sanitizeUser<T extends { passwordHash?: string | null; providerId?: string | null }>(user: T): Omit<T, "passwordHash" | "providerId"> {
	const { passwordHash, providerId, ...safeUser } = user;
	return safeUser;
}
