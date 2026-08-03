import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateOrderPayload,
	ListMyOrdersParams,
	ListMyOrdersResult,
	MyOrderDetail,
	PreviewShippingFeeResult,
} from "../types";
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
	return useQuery<MyOrderDetail>({
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

// ==========================================
// Trang thanh toán: tính trước phí ship + đặt hàng
// ==========================================
/**
 * Tính trước phí vận chuyển GHN theo giỏ hàng hiện tại + địa chỉ đã chọn. Refetch mỗi khi khách
 * đổi địa chỉ giao hàng (queryKey theo shippingAddressId); không fetch khi chưa chọn địa chỉ nào.
 */
export const usePreviewShippingFeeQuery = (shippingAddressId: number | null) => {
	return useQuery<PreviewShippingFeeResult>({
		queryKey: [...MY_ORDERS_QUERY_KEY, "shipping-fee", shippingAddressId],
		queryFn: async () => {
			const res = await orderService.previewShippingFee(shippingAddressId!);
			return res.data.data;
		},
		enabled: shippingAddressId !== null,
		// Phí ship có thể đổi giữa các lần hỏi (giỏ hàng thay đổi) -> không dùng cache cũ khi vào lại trang.
		staleTime: 0,
		retry: false,
	});
};

/** Đặt hàng thật — CHỈ gọi khi khách bấm nút "Đặt hàng" ở trang thanh toán. */
export const useCreateOrderMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
		onSuccess: () => {
			// Giỏ hàng KHÔNG bị xóa sau khi đặt hàng (backend giữ nguyên) -> không invalidate
			// CART_QUERY_KEY ở đây. Chỉ cần làm mới danh sách đơn để tab "Đơn hàng" thấy đơn mới.
			queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đặt hàng thất bại, vui lòng thử lại."));
		},
	});
};
