import { z } from "zod";
import { OtpType } from "../../generated/prisma/index.js";

// Số điện thoại Việt Nam: bắt đầu bằng 0 hoặc +84, theo sau 9-10 chữ số
const vietnamesePhoneRegex = /^(0|\+84)[0-9]{9,10}$/;

// Giỏ hàng cục bộ (localStorage, khách chưa đăng nhập) gửi kèm trong payload đăng nhập
// để merge vào DB đúng 1 lần ngay khi đăng nhập thành công — xem AuthService.login/
// loginWithGoogle/loginWithFacebook, nơi gọi thẳng cartService.mergeLocalCartToDb().
// Optional vì không phải lần đăng nhập nào cũng có giỏ hàng cục bộ để đồng bộ.
const cartItemsSchema = z
	.array(
		z.object({
			productSkuId: z.number().int().positive({ message: "productSkuId không hợp lệ." }),
			quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0." }),
		}),
	)
	.max(200, { message: "Giỏ hàng cục bộ có quá nhiều sản phẩm." })
	.default([]);

export const RegisterSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }).max(100),
		email: z.email({ message: "Email không hợp lệ." }).toLowerCase().trim(),
		phone: z.string().regex(vietnamesePhoneRegex, { message: "Số điện thoại không hợp lệ." }),
		password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." }).max(20),
	}),
});

export const LoginSchema = z.object({
	body: z.object({
		email: z.email({ message: "Email không hợp lệ." }).toLowerCase().trim(),
		password: z.string().min(1, { message: "Vui lòng nhập mật khẩu." }),
		cartItems: cartItemsSchema,
	}),
});

export const GoogleLoginSchema = z.object({
	body: z.object({
		// accessToken do hook useGoogleLogin() trả về ở phía client (OAuth 2.0 implicit
		// flow), KHÔNG phải idToken/credential JWT hay authorization code.
		accessToken: z.string().min(1, { message: "accessToken là bắt buộc." }),
		cartItems: cartItemsSchema,
	}),
});

export const FacebookLoginSchema = z.object({
	body: z.object({
		// accessToken do Facebook trả về ở phía client (One Tap / nút "Sign in with Facebook"),
		// KHÔNG phải access token hay auth code.
		accessToken: z.string().min(1, { message: "accessToken là bắt buộc." }),
		cartItems: cartItemsSchema,
	}),
});

export const VerifyOtpSchema = z.object({
	body: z.object({
		email: z.email().toLowerCase().trim(),
		otpCode: z.string().length(6, { message: "Mã OTP phải gồm 6 chữ số." }),
	}),
});

export const ResendOtpSchema = z.object({
	body: z.object({
		email: z.email().toLowerCase().trim(),
		type: z.enum([OtpType.registration, OtpType.password_reset], {
			message: "Loại OTP không hợp lệ.",
		}),
	}),
});

export const ForgotPasswordSchema = z.object({
	body: z.object({
		email: z.email().toLowerCase().trim(),
	}),
});

export const ResetPasswordSchema = z.object({
	body: z.object({
		email: z.email().toLowerCase().trim(),
		otpCode: z.string().length(6, { message: "Mã OTP phải gồm 6 chữ số." }),
		newPassword: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." }).max(100),
	}),
});

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>["body"];
export type FacebookLoginInput = z.infer<typeof FacebookLoginSchema>["body"];
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>["body"];
export type ResendOtpInput = z.infer<typeof ResendOtpSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>["body"];
