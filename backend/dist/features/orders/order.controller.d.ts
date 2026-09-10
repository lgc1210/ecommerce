import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const checkout: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const previewShippingFee: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const buyNow: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const previewBuyNowShippingFee: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listOwnOrders: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOwnOrderById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelOwnOrder: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listOrdersAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * LUÔN trả 200 (kể cả khi có lỗi xử lý nội bộ) — theo tài liệu GHN, response khác 200 sẽ khiến
 * GHN bắn lại callback này tối đa 10 lần, mỗi lần cách nhau 5 giây; lỗi xử lý phía mình (đơn
 * không tìm thấy, DB lỗi...) không phải lỗi của GHN nên không nên để GHN retry vô ích.
 */
export declare const receiveGhnWebhook: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map