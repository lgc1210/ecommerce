import { CreditCardIcon } from "../../../../components/icons";
import FormRadio from "../../../../components/form-radio";
import { PAYMENT_METHOD } from "../constants";

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

interface CheckoutPaymentMethodSectionProps {
	value: string;
	onChange: (paymentMethod: string) => void;
}

/** Chọn phương thức thanh toán cho đơn hàng. */
const CheckoutPaymentMethodSection = ({ value, onChange }: CheckoutPaymentMethodSectionProps) => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<div className='mb-4 flex items-center gap-3'>
				<CreditCardIcon className='h-5 w-5 text-primary' />
				<h2 className='text-lg font-bold text-ink'>Phương thức thanh toán</h2>
			</div>

			<div className='space-y-3'>
				{paymentMethods.map((method) => (
					<FormRadio
						key={method.id}
						variant='card'
						name='payment'
						label={method.name}
						description={method.description}
						checked={value === method.id}
						onChange={() => onChange(method.id)}
					/>
				))}
			</div>
		</section>
	);
};

export default CheckoutPaymentMethodSection;
