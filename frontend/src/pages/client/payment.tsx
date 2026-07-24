import { useMemo, useState } from "react";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import { CreditCardIcon, CouponIcon, ShieldIcon, TruckIcon } from "../../components/icons";
import { formatCurrency } from "../../utils/currency";
import { PAYMENT_METHOD } from "../../features/admin/order/constants";

const mockItems = [
	{
		id: 1,
		name: "Nike Air Max 90",
		variant: "White / 42",
		price: 2490000,
		quantity: 1,
		image: "https://placehold.co/120x120",
	},
	{
		id: 2,
		name: "Oversized Hoodie",
		variant: "Black / L",
		price: 790000,
		quantity: 2,
		image: "https://placehold.co/120x120",
	},
];

const paymentMethods: { id: string; name: string; description: string }[] = [
	{
		id: PAYMENT_METHOD.cod,
		name: "Thanh toán khi nhận hàng",
		description: "Thanh toán bằng tiền mặt khi nhận hàng",
	},
	{
		id: PAYMENT_METHOD.vnpay,
		name: "VNPay",
		description: "Thanh toán qua cổng VNPay",
	},
	{
		id: PAYMENT_METHOD.momo,
		name: "MoMo",
		description: "Ví điện tử MoMo",
	},
	{
		id: PAYMENT_METHOD.stripe,
		name: "Stripe",
		description: "Thanh toán qua cổng Stripe",
	},
	{
		id: PAYMENT_METHOD.paypal,
		name: "PayPal",
		description: "Thanh toán qua cổng PayPal",
	},
];

const PaymentPage = () => {
	const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHOD.cod);

	const subtotal = useMemo(
		() =>
			mockItems.reduce((total, item) => {
				return total + item.price * item.quantity;
			}, 0),
		[],
	);

	const shippingFee = 30000;
	const discount = 100000;

	const total = subtotal + shippingFee - discount;

	return (
		<>
			<BreadCrumb title='Thanh toán' description='Xác nhận đơn hàng và hoàn tất thanh toán' />

			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<div className='grid gap-8 lg:grid-cols-12'>
					{/* LEFT */}
					<div className='space-y-6 lg:col-span-8'>
						{/* ADDRESS */}
						<section className='rounded-3xl border border-border bg-white p-6'>
							<div className='mb-4 flex items-center gap-3'>
								<ShieldIcon className='h-5 w-5 text-primary' />
								<h2 className='text-lg font-bold text-ink'>Địa chỉ nhận hàng</h2>
							</div>

							<div className='rounded-2xl bg-cream-soft p-4'>
								<p className='font-semibold text-ink'>Lê Gia Cường</p>
								<p className='mt-1 text-sm text-muted'>0988 123 123</p>
								<p className='mt-2 text-sm text-muted'>123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM</p>
							</div>
						</section>

						{/* PRODUCTS */}
						<section className='rounded-3xl border border-border bg-white p-6'>
							<h2 className='mb-5 text-lg font-bold text-ink'>Sản phẩm</h2>

							<div className='space-y-5'>
								{mockItems.map((item) => (
									<div key={item.id} className='flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0'>
										<img
											src={item.image}
											alt={item.name}
											className='h-24 w-24 rounded-2xl border border-border object-cover'
										/>

										<div className='flex-1'>
											<h3 className='font-semibold text-ink'>{item.name}</h3>

											<p className='mt-1 text-sm text-muted'>{item.variant}</p>

											<div className='mt-3 flex items-center justify-between'>
												<span className='text-sm text-muted'>SL: {item.quantity}</span>

												<span className='font-bold text-primary'>{formatCurrency(item.price)}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</section>

						{/* SHIPPING */}
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

						{/* PAYMENT METHOD */}
						<section className='rounded-3xl border border-border bg-white p-6'>
							<div className='mb-4 flex items-center gap-3'>
								<CreditCardIcon className='h-5 w-5 text-primary' />
								<h2 className='text-lg font-bold text-ink'>Phương thức thanh toán</h2>
							</div>

							<div className='space-y-3'>
								{paymentMethods.map((method) => (
									<label
										key={method.id}
										className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
											paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border"
										}`}>
										<input
											type='radio'
											name='payment'
											checked={paymentMethod === method.id}
											onChange={() => setPaymentMethod(method.id)}
										/>

										<div>
											<p className='font-medium text-ink'>{method.name}</p>
											<p className='mt-1 text-sm text-muted'>{method.description}</p>
										</div>
									</label>
								))}
							</div>
						</section>
					</div>

					{/* RIGHT */}
					<div className='lg:col-span-4'>
						<div className='sticky top-24 space-y-6'>
							<section className='rounded-3xl border border-border bg-white p-6'>
								<div className='mb-5 flex items-center gap-3'>
									<CouponIcon className='h-6 w-6 text-primary' />
									<h2 className='font-bold text-ink'>Mã giảm giá</h2>
								</div>

								<div className='flex gap-2'>
									<input
										placeholder='Nhập mã giảm giá'
										className='h-11 rounded-full border border-border px-4 outline-none'
									/>

									<Button variant='outline'>Áp dụng</Button>
								</div>
							</section>

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

								<Button fullWidth size='lg' className='mt-6'>
									Đặt hàng
								</Button>
							</section>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentPage;
