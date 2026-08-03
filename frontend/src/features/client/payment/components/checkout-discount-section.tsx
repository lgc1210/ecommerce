import { useState } from "react";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { CouponIcon, CloseIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { useValidateCouponMutation } from "../../coupon/hooks";
import type { ValidateCouponResult } from "../../coupon/types";

interface CheckoutDiscountSectionProps {
	orderSubtotal: number;
	appliedCoupon: ValidateCouponResult | null;
	onApply: (coupon: ValidateCouponResult) => void;
	onRemove: () => void;
}

/**
 * Nhập + áp mã giảm giá (POST /coupons/validate). Chỉ TÍNH TRƯỚC số tiền được giảm để hiển thị ở
 * trang thanh toán — mã chỉ thực sự được dùng khi gửi kèm `couponCode` lúc đặt hàng (POST /orders),
 * backend sẽ tự kiểm tra lại toàn bộ điều kiện 1 lần nữa tại thời điểm đó.
 */
const CheckoutDiscountSection = ({ orderSubtotal, appliedCoupon, onApply, onRemove }: CheckoutDiscountSectionProps) => {
	const [code, setCode] = useState("");
	const validateCoupon = useValidateCouponMutation();

	const handleApply = () => {
		if (!code.trim()) return;
		validateCoupon.mutate(
			{ code: code.trim(), orderSubtotal },
			{
				onSuccess: (res) => {
					onApply(res.data.data);
					setCode("");
				},
			},
		);
	};

	return (
		<section className='rounded-3xl border border-border bg-white p-6 h-auto w-full'>
			<div className='mb-5 flex items-center gap-3'>
				<CouponIcon className='h-6 w-6 text-primary' />
				<h2 className='font-bold text-ink'>Mã giảm giá</h2>
			</div>

			{appliedCoupon ? (
				<div className='flex items-center justify-between rounded-2xl bg-cream-soft p-4'>
					<div>
						<p className='font-semibold text-ink'>{appliedCoupon.code}</p>
						<p className='mt-1 text-sm text-green-600'>Giảm {formatCurrency(appliedCoupon.discountAmount)}</p>
					</div>
					<button
						type='button'
						onClick={onRemove}
						aria-label='Bỏ mã giảm giá'
						className='cursor-pointer rounded-full p-1.5 text-muted hover:bg-white hover:text-ink'>
						<CloseIcon className='h-4 w-4' />
					</button>
				</div>
			) : (
				<div className='flex items-center gap-2 w-full h-10'>
					<FormControl
						variant='surface'
						placeholder='Nhập mã giảm giá'
						className='rounded-full! h-10!'
						wrapperClassName='w-full!'
						value={code}
						onChange={(e) => setCode(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleApply();
							}
						}}
						disabled={validateCoupon.isPending}
					/>
					<Button
						type='button'
						variant='outline'
						className='whitespace-nowrap text-xs! px-3! h-full!'
						onClick={handleApply}
						disabled={validateCoupon.isPending || !code.trim()}>
						{validateCoupon.isPending ? "Đang kiểm tra..." : "Áp dụng"}
					</Button>
				</div>
			)}
		</section>
	);
};

export default CheckoutDiscountSection;
