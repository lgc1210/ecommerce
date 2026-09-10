import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const createPaymentUrl: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/** VNPay redirect trình duyệt khách về đây sau khi thanh toán -> verify để hiển thị rồi chuyển tiếp sang trang kết quả ở frontend. */
export declare const handleVnpayReturn: (req: Request, res: Response) => Promise<void>;
/**
 * VNPay yêu cầu response CHÍNH XÁC định dạng {"RspCode": "...", "Message": "..."}, luôn trả HTTP
 * 200 (kể cả khi lỗi nghiệp vụ) — status khác 200 hoặc sai định dạng sẽ khiến VNPay coi là chưa
 * nhận được và gọi lại IPN nhiều lần.
 */
export declare const handleVnpayIpn: (req: Request, res: Response) => Promise<void>;
/**
 * ZaloPay yêu cầu response {"return_code": 1 | -1 | 0, "return_message": "..."} — return_code = 1
 * là ACK thành công (ZaloPay ngừng gọi lại); -1/0 khiến ZaloPay retry theo lịch của họ.
 */
export declare const handleZalopayCallback: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=payment-gateway.controller.d.ts.map