import { useEffect, useState, type SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/button";
import FormControl from "../../components/form-control";
import AuthLayout from "../../layouts/auth";
import paths from "../../configs/constants/paths";
import { useResetPassword } from "../../features/auth/hooks/useAuth";

const MIN_PASSWORD_LENGTH = 8;

type LocationState = {
	email?: string;
	otp?: string;
};

type Errors = {
	password?: string;
	confirmPassword?: string;
};

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { email, otp } = (state as LocationState | null) ?? {};
	const resetPasswordMutation = useResetPassword();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<Errors>({});

	// Chặn truy cập trực tiếp khi chưa đi qua bước xác thực mã ở trang quên mật khẩu
	useEffect(() => {
		if (!email || !otp) {
			navigate(paths.auth.forgotPassword, { replace: true });
		}
	}, [email, otp, navigate]);

	if (!email || !otp) return null;

	const validate = () => {
		const nextErrors: Errors = {};

		// Khớp yêu cầu của backend (ResetPasswordSchema): tối thiểu 8 ký tự,
		if (password.length < MIN_PASSWORD_LENGTH) {
			nextErrors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
		}
		if (confirmPassword !== password) {
			nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		resetPasswordMutation.mutate(
			{ email, otpCode: otp, newPassword: password },
			{
				onSuccess: () => {
					navigate(paths.auth.login, { replace: true });
				},
			},
		);
	};

	const submitting = resetPasswordMutation.isPending;

	return (
		<AuthLayout
			title='Đặt lại mật khẩu'
			subtitle={`Tạo mật khẩu mới cho tài khoản ${email}`}
			onSubmit={handleSubmit}
			showSocialLogin={false}
			footerText='Nhớ ra mật khẩu rồi?'
			footerLinkText='Đăng nhập'
			footerLinkTo={paths.auth.login}>
			<FormControl
				label='Mật khẩu mới'
				name='password'
				type='password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder='••••••••'
				error={errors.password}
				hint={!errors.password ? `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.` : undefined}
				disabled={submitting}
			/>
			<FormControl
				label='Xác nhận mật khẩu mới'
				name='confirmPassword'
				type='password'
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				placeholder='••••••••'
				error={errors.confirmPassword}
				disabled={submitting}
			/>

			<Button type='submit' fullWidth disabled={submitting}>
				{submitting ? "Đang lưu..." : "Đặt lại mật khẩu"}
			</Button>
		</AuthLayout>
	);
};

export default ResetPasswordPage;
