import { useState } from "react";
import ModalShell from "../../../../components/modal-shell";
import Button from "../../../../components/button";
import FormRadio from "../../../../components/form-radio";
import { useChangeOwnPaymentMethodMutation } from "../hooks";
import type { PaymentMethod } from "../../order/types";
import { PAYMENT_METHOD } from "../../../../shared/constants/payment";

const changeablePaymentMethods: { id: PaymentMethod; name: string; description: string }[] = [
	{ id: PAYMENT_METHOD.cod, name: "Thanh toán khi nhận hàng (COD)", description: "Thanh toán bằng tiền mặt khi nhận hàng" },
	{ id: PAYMENT_METHOD.vnpay, name: "VNPay", description: "Thanh toán qua cổng VNPay" },
	{ id: PAYMENT_METHOD.zalopay, name: "ZaloPay", description: "Thanh toán qua ví ZaloPay" },
];

interface ChangePaymentMethodModalProps {
	orderId: number;
	currentMethod: PaymentMethod;
	onClose: () => void;
}

/**
 * Modal đổi phương thức thanh toán cho 1 đơn của chính khách — chỉ được mở khi đơn còn "pending"
 * và (đang COD, hoặc đang online nhưng chưa thanh toán "completed"), xem điều kiện hiển thị nút mở
 * modal này ở order-detail/index.tsx. BE (payment.service.ts -> changeOwnPaymentMethod) tự kiểm
 * tra lại điều kiện + tự xử lý vận đơn GHN tương ứng (hủy vận đơn COD cũ khi đổi qua online, tạo
 * vận đơn COD mới khi đổi từ online sang COD) — FE chỉ cần gọi API, không tự suy luận thêm gì.
 *
 * Chỉ liệt kê 3 phương thức THẬT SỰ đã triển khai được ở BE (cod/vnpay/zalopay, xem
 * gateway.registry.ts) — khác với CheckoutPaymentMethodSection lúc đặt hàng lần đầu (liệt kê đủ 6,
 * kể cả momo/stripe/paypal chưa triển khai) vì đây là đổi lại cho 1 đơn ĐÃ TỒN TẠI, không nên cho
 * khách chọn nhầm 1 phương thức chắc chắn sẽ lỗi ngay khi bấm "Thanh toán ngay" sau đó.
 */
const ChangePaymentMethodModal = ({ orderId, currentMethod, onClose }: ChangePaymentMethodModalProps) => {
	const [selected, setSelected] = useState<PaymentMethod>(currentMethod);
	const changeMethod = useChangeOwnPaymentMethodMutation();

	const handleConfirm = () => {
		if (selected === currentMethod) {
			onClose();
			return;
		}
		changeMethod.mutate({ orderId, paymentMethod: selected }, { onSuccess: () => onClose() });
	};

	return (
		<ModalShell title='Đổi phương thức thanh toán' onClose={onClose}>
			<div className='space-y-3'>
				{changeablePaymentMethods.map((method) => (
					<FormRadio
						key={method.id}
						variant='card'
						name='change-payment-method'
						label={method.name}
						description={method.description}
						checked={selected === method.id}
						onChange={() => setSelected(method.id)}
					/>
				))}
			</div>

			<div className='mt-5 flex justify-end gap-3'>
				<Button type='button' variant='outline' size='sm' onClick={onClose} disabled={changeMethod.isPending}>
					Hủy
				</Button>
				<Button type='button' size='sm' onClick={handleConfirm} disabled={changeMethod.isPending || selected === currentMethod}>
					{changeMethod.isPending ? "Đang lưu..." : "Xác nhận"}
				</Button>
			</div>
		</ModalShell>
	);
};

export default ChangePaymentMethodModal;
