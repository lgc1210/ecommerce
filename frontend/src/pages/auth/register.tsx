import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button";
import FormControl from "../../components/form-control";
import FormCheckbox from "../../components/form-checkbox";
import AuthLayout from "../../layouts/auth";
import paths from "../../configs/constants/paths";
import { useRegister, useGoogleAuthLogin, useFacebookAuthLogin } from "../../features/auth/hooks/useAuth";
import type { AuthUser } from "../../features/auth/types";
import { getDefaultPathForRole } from "../../utils/path";

// Khớp với vietnamesePhoneRegex ở backend (features/auth/auth.validation.ts):
// bắt đầu bằng 0 hoặc +84, theo sau 9-10 chữ số.
const VIETNAMESE_PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const MIN_PASSWORD_LENGTH = 8;

type Errors = {
	fullName?: string;
	email?: string;
	phone?: string;
	password?: string;
	agreeTerms?: string;
};

const RegisterPage = () => {
	const navigate = useNavigate();
	const registerMutation = useRegister();
	const googleLoginMutation = useGoogleAuthLogin();
	const facebookLoginMutation = useFacebookAuthLogin();

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [errors, setErrors] = useState<Errors>({});

	const validate = () => {
		const nextErrors: Errors = {};

		if (fullName.trim().length < 2) {
			nextErrors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
		}
		if (!email.trim()) {
			nextErrors.email = "Vui lòng nhập email.";
		}
		if (!VIETNAMESE_PHONE_REGEX.test(phone.trim())) {
			nextErrors.phone = "Số điện thoại không hợp lệ.";
		}
		if (password.length < MIN_PASSWORD_LENGTH) {
			nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
		}
		if (!agreeTerms) {
			nextErrors.agreeTerms = "Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		registerMutation.mutate(
			{ name: fullName.trim(), email: email.trim(), phone: phone.trim(), password },
			{
				onSuccess: () => {
					// Tài khoản vừa tạo cần xác thực OTP gửi qua email trước khi đăng nhập được.
					navigate(paths.auth.verifyOtp, { state: { email: email.trim() } });
				},
			},
		);
	};

	// Đăng ký/đăng nhập bằng Google bỏ qua bước OTP (Google đã xác thực email hộ),
	// nên sau khi thành công có thể vào thẳng app theo role, giống hệt sau khi login.
	const handleGoogleSuccess = (accessToken: string) => {
		googleLoginMutation.mutate(
			{ accessToken },
			{
				onSuccess: (response) => {
					const user = response.data.data as AuthUser;
					navigate(getDefaultPathForRole(user.role.name), { replace: true });
				},
			},
		);
	};

	// Tương tự Google: Facebook đã xác thực email hộ nên bỏ qua bước OTP.
	const handleFacebookSuccess = (accessToken: string) => {
		facebookLoginMutation.mutate(
			{ accessToken },
			{
				onSuccess: (response) => {
					const user = response.data.data as AuthUser;
					navigate(getDefaultPathForRole(user.role.name), { replace: true });
				},
			},
		);
	};

	return (
		<AuthLayout
			title='Tạo tài khoản'
			subtitle='Tham gia Ecommerce để nhận ưu đãi dành riêng cho bạn.'
			onSubmit={handleSubmit}
			footerText='Đã có tài khoản?'
			footerLinkText='Đăng nhập'
			footerLinkTo={paths.auth.login}
			onGoogleSuccess={handleGoogleSuccess}
			onFacebookSuccess={handleFacebookSuccess}>
			<FormControl
				label='Họ và tên'
				name='fullName'
				placeholder='Nguyễn Văn A'
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
				error={errors.fullName}
				disabled={registerMutation.isPending}
			/>
			<FormControl
				label='Email'
				name='email'
				type='email'
				placeholder='you@example.com'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={errors.email}
				disabled={registerMutation.isPending}
			/>
			<FormControl
				label='Số điện thoại'
				name='phone'
				type='tel'
				placeholder='0912345678'
				value={phone}
				onChange={(e) => setPhone(e.target.value)}
				error={errors.phone}
				disabled={registerMutation.isPending}
			/>
			<FormControl
				label='Mật khẩu'
				name='password'
				type='password'
				placeholder='••••••••'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={errors.password}
				hint={!errors.password ? `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` : undefined}
				disabled={registerMutation.isPending}
			/>

			<FormCheckbox
				name='agreeTerms'
				label='Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật của Ecommerce.'
				checked={agreeTerms}
				onChange={(e) => setAgreeTerms(e.target.checked)}
				error={errors.agreeTerms}
			/>

			<Button type='submit' fullWidth disabled={registerMutation.isPending}>
				{registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
			</Button>
		</AuthLayout>
	);
};

export default RegisterPage;
