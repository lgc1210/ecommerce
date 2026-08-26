import apiClient from "../../../../configs/apis";
import type { BuyNowPayload, CreateOrderPayload, ListMyOrdersParams, MyOrderDetail, PreviewShippingFeeResult } from "../types";

const orderService = {
	/** Danh sách đơn hàng của chính user hiện tại (GET /orders/me), có phân trang + lọc theo trạng thái. */
	getMyOrders: (params: ListMyOrdersParams = {}) =>
		apiClient.get("/orders/me", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
			},
		}),
	/** Chi tiết 1 đơn hàng của chính user hiện tại, dùng cho màn "Chi tiết đơn hàng" + tracking. */
	getMyOrderById: (id: number) => apiClient.get(`/orders/me/${id}`),
	/** Hủy đơn — chỉ áp dụng được khi đơn đang ở trạng thái "pending" (backend tự kiểm tra lại). */
	cancelMyOrder: (id: number) => apiClient.patch(`/orders/me/${id}/cancel`),
	/**
	 * Đặt hàng thật (backend tự dựng đơn từ giỏ hàng hiện tại của user, trừ tồn kho, áp coupon nếu
	 * có) — CHỈ gọi khi khách bấm nút "Đặt hàng" ở trang thanh toán, không gọi lúc mới vào trang.
	 */
	createOrder: (payload: CreateOrderPayload) => apiClient.post<{ data: MyOrderDetail }>("/orders", payload),
	/**
	 * Tính trước phí vận chuyển GHN theo giỏ hàng hiện tại + địa chỉ đã chọn, KHÔNG tạo đơn hàng —
	 * dùng để hiển thị phí ship ở trang thanh toán trước khi khách xác nhận đặt hàng.
	 */
	previewShippingFee: (shippingAddressId: number) => apiClient.post<{ data: PreviewShippingFeeResult }>("/orders/shipping-fee", { shippingAddressId }),
	// ==========================================
	// Mua ngay — bấm "Mua ngay" ở trang chi tiết sản phẩm, đặt hàng thẳng đúng 1 SKU, không qua giỏ hàng.
	// ==========================================
	/** Đặt hàng mua ngay thật (backend chỉ tạo đơn với ĐÚNG 1 SKU + số lượng gửi lên, không đụng giỏ hàng của user). */
	buyNow: (payload: BuyNowPayload) => apiClient.post<{ data: MyOrderDetail }>("/orders/buy-now", payload),
	/** Tương tự previewShippingFee() nhưng cho đúng 1 SKU của luồng mua ngay, KHÔNG tạo đơn hàng. */
	previewBuyNowShippingFee: (params: { productSkuId: number; quantity: number; shippingAddressId: number }) =>
		apiClient.post<{ data: PreviewShippingFeeResult }>("/orders/buy-now/shipping-fee", params),
};

export default orderService;
