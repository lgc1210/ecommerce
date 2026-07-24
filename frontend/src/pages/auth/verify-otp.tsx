import { useEffect, useState, type SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/button";
import FormOtp from "../../components/form-otp";
import AuthLayout from "../../layouts/auth";
import paths from "../../configs/constants/paths";
import { useResendOtp, useVerifyOtp } from "../../features/auth/hooks/useAuth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

type LocationState = {
	email?: string;
};

const VerifyOtpPage = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { email } = (state as LocationState | null) ?? {};

	const verifyOtpMutation = useVerifyOtp();
	const resendOtpMutation = useResendOtp();

	const [otp, setOtp] = useState("");
	const [countdown, setCountdown] = useState(RESEND_SECONDS);

	// Trang này chỉ có ý nghĩa khi vừa đi qua bước đăng ký (cần biết email nào
	// đang chờ xác thực) -> nếu truy cập trực tiếp thì đưa về trang đăng ký.
	useEffect(() => {
		if (!email) {
			navigate(paths.auth.register, { replace: true });
		}
	}, [email, navigate]);

	useEffect(() => {
		if (countdown === 0) return;
		const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown]);

	if (!email) return null;

	const handleVerify = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (otp.length < OTP_LENGTH) {
			toast.error(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
			return;
		}

		verifyOtpMutation.mutate(
			{ email, otpCode: otp },
			{
				onSuccess: () => {
					navigate(paths.auth.login, { replace: true });
				},
				onError: () => {
					// Nhập sai/mã hết hạn -> xoá để người dùng nhập lại từ đầu.
					setOtp("");
				},
			},
		);
	};

	const handleResend = () => {
		if (countdown > 0 || resendOtpMutation.isPending) return;

		resendOtpMutation.mutate(
			{ email, type: "registration" },
			{
				onSuccess: () => {
					setOtp("");
					setCountdown(RESEND_SECONDS);
				},
			},
		);
	};

	const submitting = verifyOtpMutation.isPending;

	return (
		<AuthLayout
			title='Xác thực tài khoản'
			subtitle={`Nhập mã gồm ${OTP_LENGTH} chữ số vừa được gửi đến ${email}`}
			onSubmit={handleVerify}
			showSocialLogin={false}
			footerText='Nhập sai email?'
			footerLinkText='Đăng ký lại'
			footerLinkTo={paths.auth.register}>
			<FormOtp length={OTP_LENGTH} value={otp} onChange={setOtp} disabled={submitting} />

			<div className='text-center text-sm'>
				{countdown > 0 ? (
					<span className='text-muted'>Gửi lại mã sau {countdown}s</span>
				) : (
					<button
						type='button'
						onClick={handleResend}
						disabled={resendOtpMutation.isPending}
						className='font-semibold text-primary-dark hover:underline disabled:cursor-not-allowed disabled:opacity-50'>
						{resendOtpMutation.isPending ? "Đang gửi lại..." : "Gửi lại mã"}
					</button>
				)}
			</div>

			<Button type='submit' fullWidth disabled={submitting}>
				{submitting ? "Đang xác thực..." : "Xác nhận"}
			</Button>
		</AuthLayout>
	);
};

export default VerifyOtpPage;
