import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/button";
import FormControl from "../../components/form-control";
import FormOtp from "../../components/form-otp";
import AuthLayout from "../../layouts/auth";
import paths from "../../configs/constants/paths";
import { useForgotPassword, useResendOtp } from "../../features/auth/hooks/useAuth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

type Step = "email" | "otp";

const ForgotPasswordPage = () => {
	const navigate = useNavigate();
	const forgotPasswordMutation = useForgotPassword();
	const resendOtpMutation = useResendOtp();

	// Link trong email "chào mừng" (admin tạo tài khoản) trỏ tới đây kèm
	// ?email=... để điền sẵn, nhân viên chỉ cần bấm gửi mã, không phải tự gõ lại email.
	const [searchParams] = useSearchParams();

	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
	const [otp, setOtp] = useState("");
	const [countdown, setCountdown] = useState(0);

	// Đếm ngược thời gian được phép gửi lại mã
	useEffect(() => {
		if (countdown === 0) return;
		const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown]);

	const handleSendCode = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error("Vui lòng nhập email.");
			return;
		}

		forgotPasswordMutation.mutate(
			{ email: email.trim() },
			{
				onSuccess: (res) => {
					setCountdown(RESEND_SECONDS);
					setOtp("");
					setStep("otp");
					// Backend luôn trả message chung chung (chống dò email tồn tại
					// trong hệ thống - user enumeration), nên hiển thị đúng message đó.
					toast.success(res.data.message ?? `Mã xác thực đã được gửi đến ${email}`);
				},
			},
		);
	};

	const handleResend = () => {
		if (countdown > 0 || resendOtpMutation.isPending) return;

		resendOtpMutation.mutate(
			{ email, type: "password_reset" },
			{
				onSuccess: () => {
					setOtp("");
					setCountdown(RESEND_SECONDS);
				},
			},
		);
	};

	const handleVerifyOtp = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (otp.length < OTP_LENGTH) {
			toast.error(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
			return;
		}

		// Backend không có endpoint xác thực OTP độc lập cho quên mật khẩu - việc
		// xác thực mã thực sự diễn ra khi gọi POST /auth/reset-password ở bước kế
		// tiếp (email + otpCode + newPassword được kiểm tra cùng lúc). Ở đây chỉ
		// kiểm tra định dạng đủ 6 số rồi chuyển sang bước đặt mật khẩu mới.
		navigate(paths.auth.resetPassword, { state: { email, otp } });
	};

	const handleUseAnotherEmail = () => {
		setStep("email");
		setOtp("");
		setEmail("");
		setCountdown(0);
	};

	if (step === "otp") {
		return (
			<AuthLayout
				title='Xác thực mã'
				subtitle={`Nhập mã gồm ${OTP_LENGTH} chữ số vừa được gửi đến ${email}`}
				onSubmit={handleVerifyOtp}
				showSocialLogin={false}
				footerText='Nhớ ra mật khẩu rồi?'
				footerLinkText='Đăng nhập'
				footerLinkTo={paths.auth.login}>
				<FormOtp length={OTP_LENGTH} value={otp} onChange={setOtp} />

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

				<Button type='submit' fullWidth>
					Xác nhận
				</Button>

				<button
					type='button'
					onClick={handleUseAnotherEmail}
					className='block w-full text-center text-sm font-semibold text-muted hover:text-primary-dark hover:underline hover:not-disabled:cursor-pointer'>
					Dùng email khác
				</button>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title='Quên mật khẩu'
			subtitle='Nhập email để nhận mã xác thực đặt lại mật khẩu.'
			onSubmit={handleSendCode}
			showSocialLogin={false}
			footerText='Nhớ ra mật khẩu rồi?'
			footerLinkText='Đăng nhập'
			footerLinkTo={paths.auth.login}>
			<FormControl label='Email' name='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' disabled={forgotPasswordMutation.isPending} />

			<Button type='submit' fullWidth disabled={forgotPasswordMutation.isPending}>
				{forgotPasswordMutation.isPending ? "Đang gửi..." : "Gửi mã xác thực"}
			</Button>
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
