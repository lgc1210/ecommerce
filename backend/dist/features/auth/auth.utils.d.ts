import { type SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";
import type { TokenPayload } from "../../middlewares/authenticate.js";
export declare const ACCESS_TOKEN_EXPIRES_IN: NonNullable<SignOptions["expiresIn"]>;
export declare const ACCESS_TOKEN_MAX_AGE_MS: number;
export declare const REFRESH_TOKEN_EXPIRES_IN: NonNullable<SignOptions["expiresIn"]>;
export declare const REFRESH_TOKEN_MAX_AGE_MS: number;
export declare const OTP_LENGTH = 6;
export declare const OTP_EXPIRES_IN_MINUTES = 10;
export declare const OTP_MAX_ATTEMPTS = 5;
/** Sinh mã OTP dạng số, độ dài OTP_LENGTH (mặc định 6 chữ số, ví dụ "042591") */
export declare function generateOtpCode(): string;
export declare function getOtpExpiryDate(): Date;
export declare function signAccessToken(payload: TokenPayload): string;
export declare function signRefreshToken(payload: TokenPayload): string;
export declare function verifyRefreshToken(token: string): TokenPayload;
export declare function getAccessTokenCookieOptions(): CookieOptions;
export declare function getRefreshTokenCookieOptions(): CookieOptions;
export declare function sanitizeUser<T extends {
    passwordHash?: string | null;
    providerId?: string | null;
}>(user: T): Omit<T, "passwordHash" | "providerId">;
//# sourceMappingURL=auth.utils.d.ts.map