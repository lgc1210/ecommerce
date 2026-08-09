import type { PaymentMethod } from "../../../generated/prisma/index.js";

export type OnlineGatewayMethod = Exclude<(typeof PaymentMethod)[keyof typeof PaymentMethod], "cod">;

export interface CreatePaymentUrlInput {
	orderId: number;
	orderNumber: string;
	/** Số tiền thanh toán, đơn vị VND (số nguyên, KHÔNG nhân 100 — từng gateway tự nhân theo yêu cầu riêng của họ). */
	amount: number;
	orderInfo: string;
	/** IP của khách hàng lúc tạo giao dịch — 1 số cổng (VNPay) bắt buộc phải có để chống gian lận. */
	ipAddress: string;
}

export interface GatewayVerifyResult {
	/** Chữ ký/MAC có hợp lệ hay không. false -> TUYỆT ĐỐI không được tin bất kỳ field nào khác trong kết quả này. */
	isValid: boolean;
	/** ID đơn hàng nội bộ (Order.id), suy ra được từ mã giao dịch phía gateway gửi về. */
	orderId: number | null;
	/** Mã giao dịch phía gateway (dùng lưu vào Payment.transactionId để đối soát sau này). */
	transactionId: string | null;
	/** Giao dịch có thành công hay không, CHỈ có ý nghĩa khi isValid = true. */
	isSuccess: boolean;
	/** Message log/debug, không hiển thị trực tiếp cho khách. */
	message: string;
}

/**
 * Hợp đồng chung mọi cổng thanh toán online phải triển khai. Muốn thêm cổng mới (Momo, Stripe,
 * PayPal...) chỉ cần tạo 1 file `<gateway>.gateway.ts` implement interface này rồi đăng ký vào
 * `gateway.registry.ts` — không cần đụng vào service/controller/route đã có.
 */
export interface PaymentGateway {
	readonly method: OnlineGatewayMethod;

	/** Tạo URL thanh toán để redirect khách sang cổng. */
	createPaymentUrl(input: CreatePaymentUrlInput): Promise<string>;

	/**
	 * Xác thực dữ liệu redirect trình duyệt (return URL) — CHỈ dùng để hiển thị UI cho khách,
	 * KHÔNG dùng để cập nhật trạng thái thanh toán (khách có thể tắt trình duyệt giữa chừng,
	 * hoặc dữ liệu redirect của 1 số cổng — ZaloPay — không có chữ ký đáng tin cậy).
	 */
	verifyReturn(query: Record<string, unknown>): GatewayVerifyResult;

	/**
	 * Xác thực callback server-to-server (IPN) — đây là nguồn sự thật DUY NHẤT được phép dùng để
	 * chuyển trạng thái Payment (xem payment-gateway.service.ts).
	 */
	verifyIpn(payload: Record<string, unknown>): GatewayVerifyResult;
}
