import type { OrderStatus } from "../../../../shared/constants/order";
import type { PaymentMethod, PaymentStatus } from "../../../../shared/constants/payment";
import type { Pagination } from "../../../../types";
import type { DISCOUNT_TYPE } from "../constants";

// Tái dùng type OrderStatus/PaymentMethod/PaymentStatus từ feature admin/order vì
// cùng phản ánh 1 enum duy nhất ở backend (Prisma OrderStatus/PaymentMethod/PaymentStatus)
// — tránh định nghĩa trùng lặp 2 lần dễ bị lệch nếu backend đổi enum.

/**
 * 1 đơn hàng trong danh sách "Đơn hàng của tôi" (orderListInclude ở backend):
 * chỉ có payment rút gọn + đếm số items, KHÔNG có items/địa chỉ giao hàng chi
 * tiết — những trường đó chỉ có ở endpoint chi tiết (GET /orders/me/:id).
 */
export interface MyOrderListItem {
	id: number;
	orderNumber: string;
	subtotalAmount: string;
	discountAmount: string;
	shippingFee: string;
	totalAmount: string;
	orderStatus: OrderStatus;
	createdAt: string;
	updatedAt: string;
	payment: { paymentMethod: PaymentMethod; paymentStatus: PaymentStatus } | null;
	_count: { items: number };
}

export interface MyOrderItem {
	id: number;
	productSkuId: number | null;
	quantity: number;
	priceAtPurchase: string;
	/** Snapshot thuộc tính biến thể tại thời điểm mua (vd. { color: "Đen", size: "M" }), có thể null. */
	variationSnapshot: Record<string, string> | null;
	productSku: {
		id: number;
		sku: string;
		product: { id: number; name: string; slug: string } | null;
		images: { id: number; imageUrl: string; altText: string | null }[];
	} | null;
}

export interface MyOrderPayment {
	id: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	transactionId: string | null;
	amount: string;
	paidAt: string | null;
}

export interface MyOrderShippingAddress {
	id: number;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	wardName: string;
	districtName: string;
	provinceName: string;
}

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export interface MyOrderCoupon {
	id: number;
	code: string;
	discountType: DiscountType;
	discountValue: string;
}

/** Chi tiết đầy đủ 1 đơn hàng của chính user hiện tại (orderDetailInclude ở backend). */
export interface MyOrderDetail {
	id: number;
	orderNumber: string;
	subtotalAmount: string;
	discountAmount: string;
	shippingFee: string;
	totalAmount: string;
	orderStatus: OrderStatus;
	createdAt: string;
	updatedAt: string;
	items: MyOrderItem[];
	shippingAddress: MyOrderShippingAddress | null;
	coupon: MyOrderCoupon | null;
	payment: MyOrderPayment | null;
}

export interface ListMyOrdersParams {
	page?: number;
	limit?: number;
	status?: OrderStatus;
}

export interface ListMyOrdersResult {
	data: MyOrderListItem[];
	pagination: Pagination;
}

/** Payload đặt hàng (POST /orders) — đơn hàng được backend dựng trực tiếp từ giỏ hàng hiện tại của user. */
export interface CreateOrderPayload {
	shippingAddressId: number;
	paymentMethod: PaymentMethod;
	couponCode?: string;
}

/**
 * Kết quả tính trước phí vận chuyển (POST /orders/shipping-fee), dùng ở trang thanh toán để hiển
 * thị phí ship thật (GHN) theo địa chỉ đã chọn TRƯỚC khi khách bấm đặt hàng.
 */
export interface PreviewShippingFeeResult {
	subtotalAmount: number;
	shippingFee: number;
}

// ==========================================
// Mua ngay (POST /orders/buy-now) — bấm "Mua ngay" ở trang chi tiết sản phẩm, đặt hàng thẳng
// đúng 1 SKU, KHÔNG qua giỏ hàng (xem OrderService.buyNow ở backend).
// ==========================================

/**
 * Snapshot 1 SKU được chọn ở trang chi tiết sản phẩm, truyền qua router state khi điều hướng
 * sang trang "/buy-now" — đủ dữ liệu để trang mua ngay tự render mà không cần gọi lại API (giá/
 * tồn kho hiển thị chỉ mang tính tham khảo, backend luôn tự validate lại lúc đặt hàng thật, y hệt
 * tinh thần LocalCartItem ở giỏ hàng cục bộ).
 */
export interface BuyNowSnapshot {
	productSkuId: number;
	productSlug: string;
	productName: string;
	image: string;
	sku: string;
	variationDetails: Record<string, string>;
	price: number;
	oldPrice: number | null;
	stockQuantity: number;
	quantity: number;
}

/** Payload đặt hàng mua ngay (POST /orders/buy-now) — khớp BuyNowSchema ở backend. */
export interface BuyNowPayload {
	productSkuId: number;
	quantity: number;
	shippingAddressId: number;
	paymentMethod: PaymentMethod;
	couponCode?: string;
	/**
	 * FE tự sinh (crypto.randomUUID()) 1 LẦN DUY NHẤT khi vào trang mua ngay, giữ nguyên cho tới
	 * khi request đặt hàng kết thúc — BE dùng giá trị này làm gate chống double-submit (double
	 * click, hoặc client tự động retry do mất mạng). Xem CheckoutIdempotencyKey ở backend.
	 */
	idempotencyKey: string;
}
