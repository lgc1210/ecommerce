import type { OrderStatus, PaymentMethod, PaymentStatus } from "../../order/types";

/** Kết quả GET /payments/me/:orderId (paymentDetailInclude ở backend) — đầy đủ hơn MyOrderPayment
 * (vốn chỉ là bản rút gọn lồng trong MyOrderDetail), có kèm theo thông tin đơn hàng liên quan. */
export interface OwnPaymentDetail {
	id: number;
	orderId: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	transactionId: string | null;
	amount: string;
	paidAt: string | null;
	createdAt: string;
	order: {
		id: number;
		orderNumber: string;
		orderStatus: OrderStatus;
		totalAmount: string;
	};
}
