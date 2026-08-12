import type { ReactNode, SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import Button from "../../components/button";
import { FacebookIcon, GoogleIcon } from "../../components/icons";
import paths from "../../configs/constants/paths";
import { useFacebookLogin } from "../../features/auth/hooks/useFacebookSdk";

interface AuthLayoutProps {
	title: string;
	subtitle: string;
	onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
	/** Các FormControl / FormCheckbox riêng của từng form (login, register, ...) */
	children: ReactNode;
	footerText: string;
	footerLinkText: string;
	footerLinkTo: string;
	/** Ẩn nhóm nút đăng nhập mạng xã hội nếu không cần, mặc định hiển thị */
	showSocialLogin?: boolean;
	/**
	 * Nhận accessToken (OAuth 2.0 implicit flow) ngay khi Google xác thực xong, KHÔNG
	 * redirect sang trang Google rồi quay lại (đó là authorization-code/OAuth redirect
	 * flow). Lấy được từ hook useGoogleLogin() (mặc định flow: "implicit"), nên có thể
	 * gọi từ 1 <button> tự custom onClick, giống hệt cách làm của Facebook bên dưới.
	 */
	onGoogleSuccess?: (accessToken: string) => void;
	/**
	 * Nhận accessToken ngay khi Facebook xác thực xong (FB.login), KHÔNG redirect
	 * sang trang Facebook rồi quay lại. Khác với Google, Facebook JS SDK không bắt
	 * buộc phải render nút qua iframe nên có thể gọi FB.login() từ 1 <button> onClick
	 * bình thường (xem handleFacebookClick bên dưới).
	 */
	onFacebookSuccess?: (accessToken: string) => void;
}

const AuthLayout = ({ title, subtitle, onSubmit, children, footerText, footerLinkText, footerLinkTo, showSocialLogin = true, onGoogleSuccess, onFacebookSuccess }: AuthLayoutProps) => {
	const { login: loginWithFacebook } = useFacebookLogin();

	// flow mặc định "implicit" trả thẳng về accessToken (không cần đổi code ở backend
	// như "auth-code"), tương tự cơ chế FB.login() ở dưới — nên có thể tự vẽ nút và gọi
	// loginWithGoogle() từ 1 onClick bình thường, không còn phụ thuộc <GoogleLogin>.
	const loginWithGoogle = useGoogleLogin({
		onSuccess: (tokenResponse) => onGoogleSuccess?.(tokenResponse.access_token),
		onError: () => toast.error("Đăng nhập bằng Google thất bại."),
	});

	const handleFacebookClick = async () => {
		try {
			const accessToken = await loginWithFacebook();
			onFacebookSuccess?.(accessToken);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Đăng nhập bằng Facebook thất bại.");
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-cream-soft px-4 py-16'>
			<div className='w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm shadow-ink/5'>
				<Link to={paths.client.home} className='flex items-center justify-center gap-2 cursor-default!'>
					<span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-white'>E</span>
					<span className='text-xl font-extrabold tracking-tight text-ink'>Commerce</span>
				</Link>

				<h1 className='mt-6 text-center text-2xl font-extrabold text-ink'>{title}</h1>
				<p className='mt-1 text-center text-sm text-muted'>{subtitle}</p>

				<form onSubmit={onSubmit} className='mt-8 space-y-4'>
					{children}
				</form>

				{showSocialLogin && (
					<>
						<div className='mt-6 flex items-center gap-3'>
							<span className='h-px flex-1 bg-border' />
							<span className='text-xs font-medium uppercase tracking-wide text-muted'>Hoặc tiếp tục với</span>
							<span className='h-px flex-1 bg-border' />
						</div>

						<div className='mt-4 flex flex-col items-center justify-center gap-3'>
							{onGoogleSuccess && (
								<Button
									type='button'
									title='Đăng nhập bằng Google'
									variant='outline'
									fullWidth
									icon={<GoogleIcon className='h-5 w-5' />}
									iconPosition='left'
									onClick={() => loginWithGoogle()}
									className='gap-1! cursor-pointer!'>
									Sign in with Google
								</Button>
							)}
							{onFacebookSuccess && (
								<Button
									type='button'
									title='Đăng nhập bằng Facebook'
									variant='outline'
									fullWidth
									icon={<FacebookIcon className='h-5 w-5' />}
									iconPosition='left'
									onClick={handleFacebookClick}
									className='gap-1! cursor-pointer!'>
									Sign in with Facebook
								</Button>
							)}
						</div>
					</>
				)}

				<p className='mt-6 text-center text-sm text-muted'>
					{footerText}{" "}
					<Link to={footerLinkTo} className='font-semibold text-primary-dark hover:underline cursor-default!'>
						{footerLinkText}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default AuthLayout;
