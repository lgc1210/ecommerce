import type { PaymentMethod, PaymentStatus } from "../../../../shared/constants/payment";
import type { Pagination } from "../../../../types";
import type { OrderStatus } from "../../order/types";

/**
 * Đơn hàng gắn với 1 payment (paymentDetailInclude ở backend/payment.service.ts)
 * — rút gọn, KHÔNG có items/shippingAddress (payment không cần những trường đó).
 */
export interface AdminPaymentOrder {
	id: number;
	orderNumber: string;
	orderStatus: OrderStatus;
	totalAmount: string;
	userId: number | null;
	couponId: number | null;
	user: { id: number; name: string; email: string } | null;
}

/**
 * 1 giao dịch thanh toán. Backend dùng CHUNG 1 include (paymentDetailInclude) cho
 * cả list lẫn detail (khác với Order — list/detail Order có 2 shape riêng), nên ở
 * đây KHÔNG cần tách AdminPaymentListItem/AdminPaymentDetail: 1 type dùng chung.
 */
export interface AdminPayment {
	id: number;
	orderId: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	transactionId: string | null;
	amount: string;
	paidAt: string | null;
	createdAt: string | null;
	order: AdminPaymentOrder;
}

export interface ListPaymentsAdminParams {
	page?: number;
	limit?: number;
	status?: PaymentStatus;
	method?: PaymentMethod;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface ListPaymentsAdminResult {
	data: AdminPayment[];
	pagination: Pagination;
}

export interface UpdatePaymentStatusPayload {
	id: number;
	status: PaymentStatus;
	transactionId?: string;
}
