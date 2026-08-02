import { TruckIcon } from "../../../../components/icons";

/**
 * Phương thức vận chuyển. Hiện chỉ có 1 lựa chọn "Giao hàng tiêu chuẩn" (mock) —
 * sẽ mở rộng thành danh sách lựa chọn khi có API tính phí/thời gian giao hàng thật.
 */
const CheckoutDeliveryMethodSection = () => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<div className='mb-4 flex items-center gap-3'>
				<TruckIcon className='h-5 w-5 text-primary' />
				<h2 className='text-lg font-bold text-ink'>Phương thức vận chuyển</h2>
			</div>

			<div className='rounded-2xl border border-primary bg-primary/5 p-4'>
				<p className='font-medium text-ink'>Giao hàng tiêu chuẩn</p>
				<p className='mt-1 text-sm text-muted'>Dự kiến nhận hàng sau 2 - 5 ngày</p>
			</div>
		</section>
	);
};

export default CheckoutDeliveryMethodSection;
