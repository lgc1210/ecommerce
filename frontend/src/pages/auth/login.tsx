import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/button";
import FormControl from "../../components/form-control";
import AuthLayout from "../../layouts/auth";
import paths from "../../configs/constants/paths";
import { useLogin, useGoogleAuthLogin, useFacebookAuthLogin } from "../../features/auth/hooks/useAuth";
import type { AuthUser } from "../../features/auth/types";
import { getDefaultPathForRole } from "../../utils/path";

type Errors = {
	email?: string;
	password?: string;
};

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const loginMutation = useLogin();
	const googleLoginMutation = useGoogleAuthLogin();
	const facebookLoginMutation = useFacebookAuthLogin();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<Errors>({});

	const validate = () => {
		const nextErrors: Errors = {};
		if (!email.trim()) nextErrors.email = "Vui lòng nhập email.";
		if (!password) nextErrors.password = "Vui lòng nhập mật khẩu.";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const goToPostLoginPath = (user: AuthUser) => {
		const from = searchParams.get("from");
		const path = from || getDefaultPathForRole(user.role.name);
		navigate(path, { replace: true });
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		loginMutation.mutate(
			{ email, password },
			{
				onSuccess: (response) => {
					// Nếu bị redirect từ 1 route yêu cầu đăng nhập (vd. /admin, /order)
					// thì quay lại đúng trang đó, ngược lại về trang chủ.
					goToPostLoginPath(response.data.data as AuthUser);
				},
			},
		);
	};

	const handleGoogleSuccess = (accessToken: string) => {
		googleLoginMutation.mutate(
			{ accessToken },
			{
				onSuccess: (response) => {
					goToPostLoginPath(response.data.data as AuthUser);
				},
			},
		);
	};

	const handleFacebookSuccess = (accessToken: string) => {
		facebookLoginMutation.mutate(
			{ accessToken },
			{
				onSuccess: (response) => {
					goToPostLoginPath(response.data.data as AuthUser);
				},
			},
		);
	};

	return (
		<AuthLayout
			title='Đăng nhập'
			subtitle='Chào mừng bạn quay trở lại!'
			onSubmit={handleSubmit}
			footerText='Chưa có tài khoản?'
			footerLinkText='Đăng ký ngay'
			footerLinkTo={paths.auth.register}
			onGoogleSuccess={handleGoogleSuccess}
			onFacebookSuccess={handleFacebookSuccess}>
			<FormControl
				label='Email'
				name='email'
				type='email'
				placeholder='you@example.com'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={errors.email}
				disabled={loginMutation.isPending}
			/>
			<FormControl
				label='Mật khẩu'
				name='password'
				type='password'
				placeholder='••••••••'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={errors.password}
				disabled={loginMutation.isPending}
			/>
			<div className='flex items-center justify-end text-sm'>
				<Link to={paths.auth.forgotPassword} className='font-semibold text-primary-dark hover:underline cursor-default!' viewTransition>
					Quên mật khẩu?
				</Link>
			</div>

			<Button type='submit' fullWidth disabled={loginMutation.isPending}>
				{loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
			</Button>
		</AuthLayout>
	);
};

export default LoginPage;
