import apiClient from "../../../../configs/apis";
import type { ListOrdersAdminParams, UpdateOrderStatusPayload } from "../types";

const orderService = {
	getOrders: (params: ListOrdersAdminParams = {}) =>
		apiClient.get("/orders/admin", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
				userId: params.userId,
				search: params.search || undefined,
				dateFrom: params.dateFrom || undefined,
				dateTo: params.dateTo || undefined,
			},
		}),
	getOrderById: (id: number) => apiClient.get(`/orders/admin/${id}`),
	updateOrderStatus: ({ id, status }: UpdateOrderStatusPayload) =>
		apiClient.patch(`/orders/admin/${id}/status`, { status }),
};

export default orderService;
