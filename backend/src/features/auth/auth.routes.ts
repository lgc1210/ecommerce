import { Router } from "express";
import {
	register,
	verifyOtp,
	resendOtp,
	login,
	googleLogin,
	refreshToken,
	logout,
	forgotPassword,
	resetPassword,
	getMe,
	facebookLogin,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	RegisterSchema,
	LoginSchema,
	GoogleLoginSchema,
	VerifyOtpSchema,
	ResendOtpSchema,
	ForgotPasswordSchema,
	ResetPasswordSchema,
	FacebookLoginSchema,
} from "./auth.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";

const router = Router();

// ==========================================
// Public routes
// ==========================================
router.post("/register", validate(RegisterSchema), register);
router.post("/verify-otp", validate(VerifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(ResendOtpSchema), resendOtp);
router.post("/login", validate(LoginSchema), login);
router.post("/google", validate(GoogleLoginSchema), googleLogin);
router.post("/facebook", validate(FacebookLoginSchema), facebookLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

// ==========================================
// Protected routes
// ==========================================
router.get("/me", authenticateJWT, getMe);

export default router;
