import orderService from "../services";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BuyNowPayload, CreateOrderPayload, ListMyOrdersParams, ListMyOrdersResult, MyOrderDetail, PreviewShippingFeeResult } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { CART_QUERY_KEY } from "../../cart/constants";

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
			// Backend giờ đã xoá cart item khi checkout thành công (chống double-order khi bấm đặt
			// hàng nhiều lần — xem checkout() ở order.service.ts) -> phải invalidate CART_QUERY_KEY
			// để header/trang giỏ hàng phản ánh đúng giỏ hàng đã trống, không hiện lại cache cũ.
			queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đặt hàng thất bại, vui lòng thử lại."));
		},
	});
};

// ==========================================
// Mua ngay: tính trước phí ship cho 1 SKU + đặt hàng (KHÔNG đụng tới giỏ hàng của user)
// ==========================================
/**
 * Tương tự usePreviewShippingFeeQuery() nhưng tính cho ĐÚNG 1 SKU của luồng mua ngay thay vì cả
 * giỏ hàng. Không fetch khi thiếu productSkuId hoặc chưa chọn địa chỉ.
 */
export const usePreviewBuyNowShippingFeeQuery = (productSkuId: number | null, quantity: number, shippingAddressId: number | null) => {
	return useQuery<PreviewShippingFeeResult>({
		queryKey: [...MY_ORDERS_QUERY_KEY, "buy-now-shipping-fee", productSkuId, quantity, shippingAddressId],
		queryFn: async () => {
			const res = await orderService.previewBuyNowShippingFee({ productSkuId: productSkuId!, quantity, shippingAddressId: shippingAddressId! });
			return res.data.data;
		},
		enabled: productSkuId !== null && shippingAddressId !== null,
		staleTime: 0,
		retry: false,
	});
};

/** Đặt hàng mua ngay thật — CHỈ gọi khi khách bấm nút "Đặt hàng" ở trang mua ngay. */
export const useBuyNowMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: BuyNowPayload) => orderService.buyNow(payload),
		onSuccess: () => {
			// KHÔNG invalidate CART_QUERY_KEY ở đây: mua ngay không đụng tới giỏ hàng của user (xem
			// OrderService.buyNow ở backend) -> giỏ hàng thật phải giữ nguyên sau khi mua ngay thành công.
			queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đặt hàng thất bại, vui lòng thử lại."));
		},
	});
};
