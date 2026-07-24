import apiClient from "../../../configs/apis";
import type {
	FacebookLoginPayload,
	ForgotPasswordPayload,
	GoogleLoginPayload,
	LoginPayload,
	RegisterPayload,
	ResendOtpPayload,
	ResetPasswordPayload,
	VerifyOtpPayload,
} from "../types";

const authService = {
	register: (payload: RegisterPayload) => apiClient.post("/auth/register", payload),
	login: (payload: LoginPayload) => apiClient.post("/auth/login", payload),
	loginWithGoogle: (payload: GoogleLoginPayload) => apiClient.post("/auth/google", payload),
	loginWithFacebook: (payload: FacebookLoginPayload) => apiClient.post("/auth/facebook", payload),
	logout: () => apiClient.post("/auth/logout"),
	refreshToken: () => apiClient.post("/auth/refresh-token"),
	verifyOtp: (payload: VerifyOtpPayload) => apiClient.post("/auth/verify-otp", payload),
	resendOtp: (payload: ResendOtpPayload) => apiClient.post("/auth/resend-otp", payload),
	forgotPassword: (payload: ForgotPasswordPayload) => apiClient.post("/auth/forgot-password", payload),
	resetPassword: (payload: ResetPasswordPayload) => apiClient.post("/auth/reset-password", payload),
	me: () => apiClient.get("/auth/me"),
};

export default authService;
