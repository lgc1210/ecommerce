import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const listCoupons: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCouponById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateCoupon: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/** Public: đăng ký email ở trang chủ để nhận mã giảm giá chào mừng đơn hàng đầu tiên. */
export declare const requestWelcomeCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=coupon.controller.d.ts.map