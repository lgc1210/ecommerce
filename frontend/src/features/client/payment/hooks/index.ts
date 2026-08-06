import { useMutation, useQuery } from "@tanstack/react-query";
import paymentGatewayService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { PAYMENT_STATUS } from "../../../admin/order/constants";
import { ONLINE_GATEWAY_METHODS } from "../constants";

/** Tạo URL thanh toán qua cổng online (VNPay/ZaloPay/...) cho 1 đơn hàng. KHÔNG tự redirect ở đây
 * — nơi gọi (trang thanh toán / chi tiết đơn) tự quyết định điều hướng để dễ kiểm soát UX. */
export const useCreatePaymentUrlMutation = () => {
	return useMutation({
		mutationFn: (orderId: number) => paymentGatewayService.createPaymentUrl(orderId),
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể tạo giao dịch thanh toán, vui lòng thử lại."));
		},
	});
};

/**
 * Trạng thái thanh toán 1 đơn — dùng ở trang kết quả sau khi khách quay về từ cổng thanh toán.
 * Tự poll lại mỗi 2s trong khi còn "pending" (IPN server-to-server có thể đến trễ hơn vài giây so
 * với lúc trình duyệt redirect xong), dừng poll ngay khi có kết quả cuối (completed/failed/refunded).
 */
export const useOwnPaymentQuery = (orderId: number | null) => {
	return useQuery({
		queryKey: ["client", "payments", "me", orderId],
		queryFn: async () => {
			const res = await paymentGatewayService.getOwnPayment(orderId!);
			return res.data.data;
		},
		enabled: orderId !== null,
		retry: false,
		refetchInterval: (query) => {
			const data = query.state.data;
			if (!data || data.paymentStatus !== PAYMENT_STATUS.pending) {
				return false;
			}
			return ONLINE_GATEWAY_METHODS.includes(data.paymentMethod) ? 2000 : false;
		},
	});
};
