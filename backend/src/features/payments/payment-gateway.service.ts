import paymentService from "./payment.service.js";
import { getPaymentGateway } from "./gateways/gateway.registry.js";

class PaymentGatewayService {
	/**
	 * Tạo URL thanh toán cho đơn của chính user (khách bấm "Thanh toán ngay" ở trang thanh toán/chi
	 * tiết đơn) — gateway sử dụng LUÔN LÀ payment.paymentMethod đã chốt lúc checkout, KHÔNG nhận
	 * method từ client, tránh trường hợp khách tự đổi sang cổng khác với cổng đã chọn ban đầu.
	 */
	async createPaymentUrl(userId: number, orderId: number, ipAddress: string): Promise<string> {
		const payment = await paymentService.getGatewayPaymentContext(userId, orderId);
		const gateway = getPaymentGateway(payment.paymentMethod);
		return gateway.createPaymentUrl({
			orderId: payment.order.id,
			orderNumber: payment.order.orderNumber,
			amount: Number(payment.order.totalAmount),
			orderInfo: `Thanh toan don hang ${payment.order.orderNumber}`,
			ipAddress,
		});
	}

	/**
	 * Xử lý trình duyệt khách redirect về sau khi thanh toán (return URL). CHỈ dùng để hiển thị kết
	 * quả tạm thời cho khách — KHÔNG đổi trạng thái Payment ở đây (xem gateway.types.ts:
	 * verifyReturn để biết lý do). Trạng thái hiển thị luôn được đọc lại "tươi" từ DB, vì IPN
	 * thường đến gần như đồng thời hoặc trước cả lúc trình duyệt redirect xong.
	 */
	async handleReturn(method: string, query: Record<string, unknown>) {
		const gateway = getPaymentGateway(method);
		const result = gateway.verifyReturn(query);
		if (!result.orderId) {
			return { orderId: null, paymentStatus: null, message: "Không xác định được đơn hàng từ dữ liệu trả về." };
		}
		const paymentStatus = await paymentService.getPaymentStatusByOrderId(result.orderId);
		return { orderId: result.orderId, paymentStatus, message: result.message };
	}

	/**
	 * Xử lý callback server-to-server (IPN) — NGUỒN SỰ THẬT DUY NHẤT được phép cập nhật trạng thái
	 * Payment. Chữ ký/MAC không hợp lệ -> bỏ qua hoàn toàn, không đổi bất kỳ trạng thái nào.
	 */
	async handleIpn(method: string, payload: Record<string, unknown>) {
		const gateway = getPaymentGateway(method);
		const result = gateway.verifyIpn(payload);
		if (!result.isValid || !result.orderId) {
			return { ok: false, message: result.message };
		}
		try {
			if (result.isSuccess) {
				await paymentService.completeGatewayPayment(result.orderId, result.transactionId);
			} else {
				await paymentService.failGatewayPayment(result.orderId, result.transactionId);
			}
			return { ok: true, message: "Đã cập nhật trạng thái thanh toán." };
		} catch (error: any) {
			// Lỗi nghiệp vụ (vd không tìm thấy payment, chuyển trạng thái không hợp lệ) — vẫn trả lời
			// gateway bình thường (controller tự quyết định ack) để tránh bị retry vô ích; log lại
			// để đối soát thủ công nếu cần.
			console.error(`[payment-gateway:${method}] Xử lý IPN thất bại cho orderId=${result.orderId}:`, error?.message ?? error);
			return { ok: false, message: error?.message ?? "Lỗi xử lý nội bộ." };
		}
	}
}

export default new PaymentGatewayService();
