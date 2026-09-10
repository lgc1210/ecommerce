import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const getOwnPayment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const confirmOwnPayment: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/** Khách đổi phương thức thanh toán cho đơn của chính mình — chỉ khi đơn còn "pending" và chưa thanh toán online thành công (xem payment.service.ts -> changeOwnPaymentMethod). */
export declare const changeOwnPaymentMethod: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listPaymentsAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updatePaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=payment.controller.d.ts.map