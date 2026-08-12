export interface RegisterPayload {
	name: string;
	email: string;
	phone: string;
	password: string;
}

/** 1 dòng giỏ hàng cục bộ (localStorage) gửi kèm khi đăng nhập để đồng bộ vào DB. */
interface PendingCartItem {
	productSkuId: number;
	quantity: number;
}

export interface LoginPayload {
	email: string;
	password: string;
	/** Gắn tự động bởi useLogin() từ giỏ hàng cục bộ hiện có — component gọi hook không cần truyền tay. */
	cartItems?: PendingCartItem[];
}

export interface GoogleLoginPayload {
	/** accessToken trả về từ hook useGoogleLogin() (OAuth 2.0 implicit flow), không phải idToken/credential JWT. */
	accessToken: string;
	cartItems?: PendingCartItem[];
}

export interface FacebookLoginPayload {
	/** accessToken trả về từ Facebook JavaScript SDK (FB.login), không phải authorization code. */
	accessToken: string;
	cartItems?: PendingCartItem[];
}

export interface VerifyOtpPayload {
	email: string;
	otpCode: string;
}

export interface ResendOtpPayload {
	email: string;
	type: "registration" | "password_reset";
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ResetPasswordPayload {
	email: string;
	otpCode: string;
	newPassword: string;
}

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	phone: string;
	roleId: number;
	provider: string;
	isActive: boolean;
	isVerified: boolean;
	role: { id: number; name: string };
	permissions: string[];
}
