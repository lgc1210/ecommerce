import Button from "../../../../components/button";
import { formatCurrency } from "../../../../utils/currency";

interface CheckoutSummarySectionProps {
	subtotal: number;
	shippingFee: number;
	discount: number;
	total: number;
	onPlaceOrder: () => void;
	isPlacingOrder?: boolean;
	disabled?: boolean;
}

/** Tóm tắt đơn hàng (tạm tính / phí vận chuyển / giảm giá / tổng cộng) + nút đặt hàng. */
const CheckoutSummarySection = ({ subtotal, shippingFee, discount, total, onPlaceOrder, isPlacingOrder = false, disabled = false }: CheckoutSummarySectionProps) => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<h2 className='mb-5 text-lg font-bold text-ink'>Tóm tắt đơn hàng</h2>

			<div className='space-y-3 text-sm'>
				<div className='flex justify-between'>
					<span>Tạm tính</span>
					<span>{formatCurrency(subtotal)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Phí vận chuyển</span>
					<span>{formatCurrency(shippingFee)}</span>
				</div>
				<div className='flex justify-between text-green-600'>
					<span>Giảm giá</span>
					<span>-{formatCurrency(discount)}</span>
				</div>
			</div>

			<div className='my-5 border-t border-border' />

			<div className='flex items-center justify-between'>
				<span className='font-semibold text-ink'>Tổng cộng</span>
				<span className='text-2xl font-extrabold text-primary'>{formatCurrency(total)}</span>
			</div>

			<Button type='button' fullWidth size='lg' className='mt-6' onClick={onPlaceOrder} disabled={disabled || isPlacingOrder}>
				{isPlacingOrder ? "Đang đặt hàng..." : "Đặt hàng"}
			</Button>
		</section>
	);
};

export default CheckoutSummarySection;
