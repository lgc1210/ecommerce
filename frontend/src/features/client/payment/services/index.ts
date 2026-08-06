import apiClient from "../../../../configs/apis";
import type { OwnPaymentDetail } from "../types";

const paymentGatewayService = {
	/**
	 * Tạo URL thanh toán qua cổng online (VNPay/ZaloPay/...) cho đơn của chính mình — gateway được
	 * BE tự suy ra từ payment.paymentMethod đã chốt lúc đặt hàng, không cần truyền lên đây.
	 * Dùng để redirect trình duyệt khách sang trang gateway ngay sau khi đặt hàng thành công, hoặc
	 * để thử lại thanh toán cho 1 đơn đang "pending"/"failed" (xem order-detail.tsx).
	 */
	createPaymentUrl: (orderId: number) => apiClient.post<{ data: { url: string } }>(`/payments/me/${orderId}/pay`),
	/** Đọc trạng thái thanh toán hiện tại của 1 đơn — dùng ở trang kết quả (payment-result.tsx) để xác nhận thật (không tin query params redirect thô). */
	getOwnPayment: (orderId: number) => apiClient.get<{ data: OwnPaymentDetail }>(`/payments/me/${orderId}`),
};

export default paymentGatewayService;
