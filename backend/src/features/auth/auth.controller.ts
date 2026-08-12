import type { Response, NextFunction } from "express";
import type { Request } from "express";
import authService from "./auth.service.js";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "./auth.utils.js";
import { TOKENS } from "./auth.constant.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { name, email, phone, password } = req.body;
		const user = await authService.register({ name, email, phone, password });
		res.status(201).json({
			message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực tài khoản.",
			data: user,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email, otpCode } = req.body;
		const user = await authService.verifyRegistrationOtp({ email, otpCode });

		res.status(200).json({
			message: "Xác thực tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.",
			data: user,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email, type } = req.body;
		await authService.resendOtp({ email, type });

		res.status(200).json({ message: "Mã OTP mới đã được gửi tới email của bạn." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email, password, cartItems } = req.body;
		const { user, accessToken, refreshToken, cart, skippedItems } = await authService.login({ email, password, cartItems });

		res.cookie(TOKENS.accessToken, accessToken, getAccessTokenCookieOptions());
		res.cookie(TOKENS.refreshToken, refreshToken, getRefreshTokenCookieOptions());

		res.status(200).json({
			message: "Đăng nhập thành công.",
			data: user,
			cart,
			skippedItems,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { accessToken, cartItems } = req.body;
		const { user, accessToken: newAccessToken, refreshToken, cart, skippedItems } = await authService.loginWithGoogle({ accessToken, cartItems });

		res.cookie(TOKENS.accessToken, newAccessToken, getAccessTokenCookieOptions());
		res.cookie(TOKENS.refreshToken, refreshToken, getRefreshTokenCookieOptions());

		res.status(200).json({
			message: "Đăng nhập thành công.",
			data: user,
			cart,
			skippedItems,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const facebookLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { accessToken, cartItems } = req.body;
		const { user, accessToken: newAccessToken, refreshToken, cart, skippedItems } = await authService.loginWithFacebook({ accessToken, cartItems });

		res.cookie(TOKENS.accessToken, newAccessToken, getAccessTokenCookieOptions());
		res.cookie(TOKENS.refreshToken, refreshToken, getRefreshTokenCookieOptions());

		res.status(200).json({
			message: "Đăng nhập thành công.",
			data: user,
			cart,
			skippedItems,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const rawRefreshToken = req.cookies?.refreshToken;
		if (!rawRefreshToken) {
			res.status(401).json({ error: "Không tìm thấy refresh token, vui lòng đăng nhập lại." });
			return;
		}

		const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(rawRefreshToken);

		res.cookie(TOKENS.accessToken, accessToken, getAccessTokenCookieOptions());
		res.cookie(TOKENS.refreshToken, newRefreshToken, getRefreshTokenCookieOptions());

		res.status(200).json({ message: "Làm mới token thành công." });
	} catch (error) {
		// Refresh token không hợp lệ -> dọn cookie phía client luôn cho sạch session
		res.clearCookie(TOKENS.accessToken);
		res.clearCookie(TOKENS.refreshToken);
		handleServiceError(error, res, next);
	}
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const rawRefreshToken = req.cookies?.refreshToken;
		await authService.logout(rawRefreshToken);

		res.clearCookie(TOKENS.accessToken, getAccessTokenCookieOptions());
		res.clearCookie(TOKENS.refreshToken, getRefreshTokenCookieOptions());

		res.status(200).json({ message: "Đăng xuất thành công." });
	} catch (error) {
		next(error);
	}
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email } = req.body;
		await authService.forgotPassword({ email });

		// Luôn trả về message chung chung dù email có tồn tại hay không (chống user enumeration)
		res.status(200).json({
			message: "Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi tới email đó.",
		});
	} catch (error) {
		next(error);
	}
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email, otpCode, newPassword } = req.body;
		await authService.resetPassword({ email, otpCode, newPassword });

		res.status(200).json({ message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Chưa đăng nhập." });
			return;
		}

		const user = await authService.getMe(req.user.id);
		res.status(200).json({ data: user });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
