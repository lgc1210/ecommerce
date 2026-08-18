import { useState, type SubmitEvent } from "react";
import Button from "../../../../../components/button";
import FormControl from "../../../../../components/form-control";
import { useRequestWelcomeCouponMutation } from "../../../coupon/hooks";

/** Form đăng ký email nhận mã giảm giá chào mừng đơn hàng đầu tiên. */
const NewsletterSection = () => {
	const [welcomeEmail, setWelcomeEmail] = useState("");
	const requestWelcomeCouponMutation = useRequestWelcomeCouponMutation();

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (!welcomeEmail) return;
		requestWelcomeCouponMutation.mutate(welcomeEmail, {
			onSuccess: () => setWelcomeEmail(""),
		});
	};

	return (
		<section className='border-t border-border bg-primary'>
			<div className='mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8'>
				<h2 className='text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>Đăng ký nhận ưu đãi 25% cho đơn hàng đầu tiên</h2>
				<p className='mt-2 text-sm text-white/80'>Nhận thông tin sản phẩm mới và mã giảm giá độc quyền qua email.</p>
				<form onSubmit={handleSubmit} className='mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'>
					<FormControl
						type='email'
						required
						placeholder='Nhập email của bạn'
						className='flex-1 rounded-full!'
						value={welcomeEmail}
						onChange={(e) => setWelcomeEmail(e.target.value)}
						disabled={requestWelcomeCouponMutation.isPending}
					/>
					<Button type='submit' variant='dark' disabled={requestWelcomeCouponMutation.isPending} className='h-12 shrink-0 rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft'>
						{requestWelcomeCouponMutation.isPending ? "Đang gửi..." : "Đăng ký"}
					</Button>
				</form>
			</div>
		</section>
	);
};

export default NewsletterSection;
