import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListMyOrdersParams, ListMyOrdersResult } from "../types";
import orderService from "../services";
import type { AdminOrderDetail } from "../../../admin/order/types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const MY_ORDERS_QUERY_KEY = ["client", "orders", "me"] as const;

/** Danh sách đơn hàng của chính user hiện tại, dùng cho tab "Đơn hàng" ở trang tài khoản. */
export const useMyOrdersQuery = (params: ListMyOrdersParams) => {
	return useQuery<ListMyOrdersResult>({
		queryKey: [...MY_ORDERS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await orderService.getMyOrders(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Chi tiết 1 đơn hàng — danh sách (orderListInclude) không có sẵn items/địa chỉ
 * giao hàng, nên khi mở chi tiết phải gọi riêng GET /orders/me/:id.
 */
export const useMyOrderDetailQuery = (orderId: number | null) => {
	return useQuery<AdminOrderDetail>({
		queryKey: [...MY_ORDERS_QUERY_KEY, "detail", orderId],
		queryFn: async () => {
			const res = await orderService.getMyOrderById(orderId!);
			return res.data.data;
		},
		enabled: orderId !== null,
	});
};

/** Khách tự hủy đơn — chỉ khi đơn còn ở trạng thái "pending" (backend validate lại). */
export const useCancelMyOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (orderId: number) => orderService.cancelMyOrder(orderId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã hủy đơn hàng.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Hủy đơn thất bại."));
		},
	});
};
