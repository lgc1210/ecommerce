import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { CouponIcon } from "../../../../components/icons";

/**
 * Nhập mã giảm giá. Hiện chưa gọi API áp dụng coupon (mock) — sẽ nối khi có
 * API tạo đơn hàng thật (POST /orders nhận `couponCode`).
 */
const CheckoutDiscountSection = () => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6 h-auto w-full'>
			<div className='mb-5 flex items-center gap-3'>
				<CouponIcon className='h-6 w-6 text-primary' />
				<h2 className='font-bold text-ink'>Mã giảm giá</h2>
			</div>

			<div className='flex items-center gap-2 w-full h-10'>
				<FormControl
					variant='surface'
					placeholder='Nhập mã giảm giá'
					className='rounded-full! h-10!'
					wrapperClassName='w-full!'
				/>
				<Button variant='outline' className='whitespace-nowrap text-xs! px-3! h-full!'>
					Áp dụng
				</Button>
			</div>
		</section>
	);
};

export default CheckoutDiscountSection;
