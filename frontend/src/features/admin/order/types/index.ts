import type { DiscountType } from "../../../../shared/constants/coupon";
import type { OrderStatus } from "../../../../shared/constants/order";
import type { PaymentMethod, PaymentStatus } from "../../../../shared/constants/payment";
import type { Pagination } from "../../../../types";

/**
 * 1 đơn hàng trong bảng danh sách (orderListInclude ở backend): chỉ có thông tin
 * rút gọn của user/payment + đếm số items, KHÔNG có items/shippingAddress/coupon
 * chi tiết — những trường đó chỉ trả về ở endpoint chi tiết (GET /orders/admin/:id).
 */
export interface AdminOrderListItem {
	id: number;
	orderNumber: string;
	subtotalAmount: string;
	discountAmount: string;
	shippingFee: string;
	totalAmount: string;
	orderStatus: OrderStatus;
	createdAt: string;
	updatedAt: string;
	user: { id: number; name: string; email: string } | null;
	payment: { paymentMethod: PaymentMethod; paymentStatus: PaymentStatus } | null;
	_count: { items: number };
}

export interface AdminOrderItem {
	id: number;
	productSkuId: number | null;
	quantity: number;
	priceAtPurchase: string;
	/** Snapshot thuộc tính biến thể tại thời điểm mua (vd. { color: "Đen", size: "M" }), có thể null nếu sản phẩm không có biến thể. */
	variationSnapshot: Record<string, string> | null;
	productSku: {
		id: number;
		sku: string;
		product: { id: number; name: string; slug: string } | null;
	} | null;
}

export interface AdminOrderPayment {
	id: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	transactionId: string | null;
	amount: string;
	paidAt: string | null;
}

export interface AdminOrderShippingAddress {
	id: number;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	wardName: string;
	districtName: string;
	provinceName: string;
}

export interface AdminOrderCoupon {
	id: number;
	code: string;
	discountType: DiscountType;
	discountValue: string;
}

/** Chi tiết đầy đủ 1 đơn hàng (orderDetailInclude ở backend), dùng cho modal chi tiết. */
export interface AdminOrderDetail {
	id: number;
	userId: number | null;
	shippingAddressId: number | null;
	couponId: number | null;
	orderNumber: string;
	subtotalAmount: string;
	discountAmount: string;
	shippingFee: string;
	totalAmount: string;
	orderStatus: OrderStatus;
	createdAt: string;
	updatedAt: string;
	items: AdminOrderItem[];
	user: { id: number; name: string; email: string; phone: string | null } | null;
	shippingAddress: AdminOrderShippingAddress | null;
	coupon: AdminOrderCoupon | null;
	payment: AdminOrderPayment | null;
}

export interface ListOrdersAdminParams {
	page?: number;
	limit?: number;
	status?: OrderStatus;
	userId?: number;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface ListOrdersAdminResult {
	data: AdminOrderListItem[];
	pagination: Pagination;
}

export interface UpdateOrderStatusPayload {
	id: number;
	status: OrderStatus;
}
