import { useState } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";
import { MailIcon, UserIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { formatDate } from "../../../../utils";
import { useUpdatePaymentStatus } from "../hooks";
import type { AdminPayment } from "../types";
import { getNextPaymentStatusOptions, isTerminalPaymentStatus, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "../utils";
import PaymentStatusBadge from "./payment-status-badge";
import OrderStatusBadge from "../../order/components/order-status-badge";
import type { PaymentStatus } from "../../../../shared/constants/payment";

interface PaymentDetailModalProps {
	payment: AdminPayment;
	onClose: () => void;
}

interface PaymentDetailContentProps {
	payment: AdminPayment;
}

/**
 * Tách riêng phần nội dung để state `pendingStatus`/`transactionIdInput` khởi tạo lại (qua
 * `key` ở component cha, xem PaymentDetailModal bên dưới) mỗi khi `payment.paymentStatus` đổi
 * trên server — vd. sau khi lưu thành công — thay vì phải đồng bộ bằng useEffect.
 */
const PaymentDetailContent = ({ payment }: PaymentDetailContentProps) => {
	const updatePaymentStatus = useUpdatePaymentStatus();
	const [pendingStatus, setPendingStatus] = useState<PaymentStatus>(payment.paymentStatus);
	const [transactionIdInput, setTransactionIdInput] = useState(payment.transactionId ?? "");

	const hasChanged = pendingStatus !== payment.paymentStatus || transactionIdInput !== (payment.transactionId ?? "");
	const statusOptions = getNextPaymentStatusOptions(payment.paymentStatus);

	return (
		<div className='max-h-[75vh] space-y-5 overflow-y-auto pr-1'>
			{/* Header */}
			<div className='flex flex-wrap items-start justify-between gap-2'>
				<div>
					<p className='font-semibold text-ink'>Đơn {payment.order.orderNumber}</p>
					<p className='mt-1 text-xs text-muted'>Tạo giao dịch lúc {payment.createdAt ? formatDate(payment.createdAt) : "—"}</p>
				</div>
				<div className='flex flex-col items-end gap-1.5'>
					<PaymentStatusBadge status={payment.paymentStatus} />
					<OrderStatusBadge status={payment.order.orderStatus} />
				</div>
			</div>

			{/* Khách hàng */}
			<div className='space-y-2 rounded-xl bg-cream-soft p-4 text-sm'>
				<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Khách hàng</p>
				<div className='flex items-center gap-2 text-ink'>
					<UserIcon className='h-4 w-4 shrink-0 text-muted' />
					<span className='font-medium'>{payment.order.user?.name ?? "Khách vãng lai"}</span>
				</div>
				{payment.order.user && (
					<div className='flex items-center gap-2 text-ink/80'>
						<MailIcon className='h-4 w-4 shrink-0 text-muted' />
						<a href={`mailto:${payment.order.user.email}`} className='hover:underline'>
							{payment.order.user.email}
						</a>
					</div>
				)}
			</div>

			{/* Thông tin giao dịch */}
			<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
				<div className='flex justify-between text-ink/80'>
					<span>Phương thức</span>
					<span className='font-medium text-ink'>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</span>
				</div>
				<div className='flex justify-between text-ink/80'>
					<span>Số tiền</span>
					<span className='font-medium text-ink'>{formatCurrency(Number(payment.amount))}</span>
				</div>
				<div className='flex justify-between text-ink/80'>
					<span>Tổng tiền đơn hàng</span>
					<span>{formatCurrency(Number(payment.order.totalAmount))}</span>
				</div>
				{payment.paidAt && (
					<div className='flex justify-between text-ink/80'>
						<span>Thanh toán lúc</span>
						<span>{formatDate(payment.paidAt)}</span>
					</div>
				)}
			</div>

			{/* Đổi trạng thái */}
			<div className='space-y-3 border-t border-border pt-4'>
				<div className='flex items-end gap-3'>
					<FormSelect
						label='Trạng thái thanh toán'
						wrapperClassName='flex-1'
						value={pendingStatus}
						disabled={isTerminalPaymentStatus(payment.paymentStatus)}
						onChange={(e) => setPendingStatus(e.target.value as PaymentStatus)}
						options={statusOptions.map((status) => ({ value: status, label: PAYMENT_STATUS_LABEL[status] }))}
					/>
				</div>
				<FormControl
					label='Mã giao dịch (tuỳ chọn)'
					placeholder='Mã giao dịch từ ngân hàng/ví điện tử'
					value={transactionIdInput}
					disabled={isTerminalPaymentStatus(payment.paymentStatus)}
					onChange={(e) => setTransactionIdInput(e.target.value)}
				/>
				<div className='flex justify-end'>
					<Button
						size='sm'
						type='button'
						disabled={!hasChanged || updatePaymentStatus.isPending}
						onClick={() =>
							updatePaymentStatus.mutate({
								id: payment.id,
								status: pendingStatus,
								transactionId: transactionIdInput.trim() || undefined,
							})
						}>
						{updatePaymentStatus.isPending ? "Đang lưu..." : "Lưu thay đổi"}
					</Button>
				</div>
			</div>
		</div>
	);
};

/**
 * Modal xem chi tiết + đổi trạng thái 1 giao dịch thanh toán. Nhận thẳng đối tượng `payment`
 * đã có sẵn từ bảng danh sách (không fetch lại) vì backend dùng chung 1 include cho cả list
 * lẫn detail — xem docstring usePaymentsAdminQuery trong hooks/index.ts.
 */
const PaymentDetailModal = ({ payment, onClose }: PaymentDetailModalProps) => {
	return (
		<ModalShell title='Chi tiết thanh toán' onClose={onClose} maxWidthClassName='max-w-xl'>
			<PaymentDetailContent key={`${payment.id}-${payment.paymentStatus}`} payment={payment} />
		</ModalShell>
	);
};

export default PaymentDetailModal;
