import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	AdminOrderDetail,
	ListOrdersAdminParams,
	ListOrdersAdminResult,
	UpdateOrderStatusPayload,
} from "../types";
import orderService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_ORDERS_QUERY_KEY = ["admin", "orders"] as const;

/** Danh sách đơn hàng có phân trang/tìm kiếm/lọc theo trạng thái + khoảng ngày, dùng cho bảng quản trị Order. */
export const useOrdersAdminQuery = (params: ListOrdersAdminParams) => {
	return useQuery<ListOrdersAdminResult>({
		queryKey: [...ADMIN_ORDERS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await orderService.getOrders(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Chi tiết 1 đơn hàng (items/địa chỉ giao hàng/coupon/payment) — bảng danh sách
 * (orderListInclude) không có sẵn những trường này, nên modal chi tiết phải tự
 * gọi riêng endpoint GET /orders/admin/:id khi user click vào 1 dòng.
 */
export const useOrderDetailQuery = (orderId: number | null) => {
	return useQuery<AdminOrderDetail>({
		queryKey: [...ADMIN_ORDERS_QUERY_KEY, "detail", orderId],
		queryFn: async () => {
			const res = await orderService.getOrderById(orderId!);
			return res.data.data;
		},
	});
};

/**
 * Đổi trạng thái xử lý 1 đơn hàng (vd. "pending" -> "processing"). Backend chỉ
 * chấp nhận một số bước chuyển hợp lệ (xem order.utils.ts:isValidOrderStatusTransition)
 * và trả lỗi 400 nếu chuyển sai bước, message lỗi đó được hiển thị trực tiếp qua toast.
 * Khi chuyển sang "cancelled", backend tự hoàn tồn kho + hoàn lượt dùng coupon.
 */
export const useUpdateOrderStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateOrderStatusPayload) => orderService.updateOrderStatus(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật trang thái đơn hàng thành công.");
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err, "Cập nhật trang thái đơn hàng thất bại."));
		},
	});
};
