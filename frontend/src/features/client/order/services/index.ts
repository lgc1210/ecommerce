import apiClient from "../../../../configs/apis";
import type { ListMyOrdersParams } from "../types";

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
};

export default orderService;
