import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const listReviewsByProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** Danh sách review CHÍNH user hiện tại đã viết — dùng cho tab "Đánh giá của tôi" (sửa/xóa). */
export declare const listMyReviews: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listReviewableOrderItems: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listReviewsAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const hideReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const unhideReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const adminDeleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReply: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReply: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteReply: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map