import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import { env } from "../../config/dotenv.js";
import paymentGatewayService from "./payment-gateway.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
import type { PaymentStatus } from "../../generated/prisma/index.js";
import { PAYMENT_METHOD } from "../payments/payment.constant.js";

// ==========================================
// Self-service: tạo URL thanh toán cho đơn của chính mình
// ==========================================
export const createPaymentUrl = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const orderId = Number(req.params.orderId);
		// req.ip tôn trọng "trust proxy" nếu app đặt sau reverse proxy/load balancer; fallback về
		// socket address khi không xác định được (vd môi trường dev chạy trực tiếp).
		const ipAddress = req.ip || req.socket.remoteAddress || "127.0.0.1";
		const url = await paymentGatewayService.createPaymentUrl(req.user!.id, orderId, ipAddress);
		res.status(200).json({ data: { url } });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Return (redirect trình duyệt khách) — public, không auth
// ==========================================
const STATUS_TO_RESULT: Record<PaymentStatus, string> = {
	completed: "success",
	failed: "failed",
	pending: "pending",
	refunded: "refunded",
};

/** VNPay redirect trình duyệt khách về đây sau khi thanh toán -> verify để hiển thị rồi chuyển tiếp sang trang kết quả ở frontend. */
export const handleVnpayReturn = async (req: Request, res: Response): Promise<void> => {
	const result = await paymentGatewayService.handleReturn(PAYMENT_METHOD.vnpay, req.query as Record<string, unknown>);
	const status = result.paymentStatus ? (STATUS_TO_RESULT[result.paymentStatus] ?? "unknown") : "unknown";
	const params = new URLSearchParams({ method: PAYMENT_METHOD.vnpay, status, ...(result.orderId ? { orderId: String(result.orderId) } : {}) });
	res.redirect(`${env.CLIENT_URL}/payment/result?${params.toString()}`);
};

// ==========================================
// IPN / Callback (server-to-server, gateway gọi trực tiếp) — public, không auth
// ==========================================
/**
 * VNPay yêu cầu response CHÍNH XÁC định dạng {"RspCode": "...", "Message": "..."}, luôn trả HTTP
 * 200 (kể cả khi lỗi nghiệp vụ) — status khác 200 hoặc sai định dạng sẽ khiến VNPay coi là chưa
 * nhận được và gọi lại IPN nhiều lần.
 */
export const handleVnpayIpn = async (req: Request, res: Response): Promise<void> => {
	const result = await paymentGatewayService.handleIpn(PAYMENT_METHOD.vnpay, req.query as Record<string, unknown>);
	if (!result.ok) {
		res.status(200).json({ RspCode: "97", Message: result.message || "Invalid signature or unknown error" });
		return;
	}
	res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
};

/**
 * ZaloPay yêu cầu response {"return_code": 1 | -1 | 0, "return_message": "..."} — return_code = 1
 * là ACK thành công (ZaloPay ngừng gọi lại); -1/0 khiến ZaloPay retry theo lịch của họ.
 */
export const handleZalopayCallback = async (req: Request, res: Response): Promise<void> => {
	const result = await paymentGatewayService.handleIpn(PAYMENT_METHOD.zalopay, req.body as Record<string, unknown>);
	if (!result.ok) {
		res.status(200).json({ return_code: -1, return_message: result.message || "mac not match" });
		return;
	}
	res.status(200).json({ return_code: 1, return_message: "success" });
};
