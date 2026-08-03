import { TruckIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";

interface CheckoutDeliveryMethodSectionProps {
	shippingFee: number | null;
	isLoading: boolean;
	isError: boolean;
}

/**
 * Phương thức vận chuyển. Hiện chỉ có 1 lựa chọn "Giao hàng tiêu chuẩn" của GHN (Giao Hàng Nhanh)
 * — phí hiển thị ở đây là phí THẬT, tính theo địa chỉ đã chọn qua POST /orders/shipping-fee
 * (xem usePreviewShippingFeeQuery), không phải giá trị cố định.
 */
const CheckoutDeliveryMethodSection = ({ shippingFee, isLoading, isError }: CheckoutDeliveryMethodSectionProps) => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<div className='mb-4 flex items-center gap-3'>
				<TruckIcon className='h-5 w-5 text-primary' />
				<h2 className='text-lg font-bold text-ink'>Phương thức vận chuyển</h2>
			</div>

			<div className='rounded-2xl border border-primary bg-primary/5 p-4'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='font-medium text-ink'>Giao hàng tiêu chuẩn (GHN)</p>
						<p className='mt-1 text-sm text-muted'>Dự kiến nhận hàng sau 2 - 5 ngày</p>
					</div>

					{isLoading ? (
						<span className='text-sm text-muted'>Đang tính phí...</span>
					) : isError ? (
						<span className='text-sm font-medium text-red-600'>Không thể tính phí ship</span>
					) : shippingFee !== null ? (
						<span className='font-bold text-primary'>{formatCurrency(shippingFee)}</span>
					) : null}
				</div>

				{isError && (
					<p className='mt-2 text-xs text-red-600'>
						Địa chỉ này có thể nằm ngoài khu vực phục vụ của GHN, vui lòng thử địa chỉ khác.
					</p>
				)}
			</div>
		</section>
	);
};

export default CheckoutDeliveryMethodSection;
