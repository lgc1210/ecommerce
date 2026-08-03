import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import couponService from "./coupon.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Admin
// ==========================================
export const listCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await couponService.listCoupons(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getCouponById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const coupon = await couponService.getCouponById(id);
		res.status(200).json({ data: coupon });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const coupon = await couponService.createCoupon(req.body);
		res.status(201).json({ message: "Tạo mã giảm giá thành công.", data: coupon });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const coupon = await couponService.updateCoupon(id, req.body);
		res.status(200).json({ message: "Cập nhật mã giảm giá thành công.", data: coupon });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		await couponService.deleteCoupon(id);
		res.status(200).json({ message: "Xóa mã giảm giá thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Public / Customer
// ==========================================
export const validateCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { code, orderSubtotal } = req.body;
		const result = await couponService.validateCoupon(code, orderSubtotal, req.user?.email);
		res.status(200).json({ data: result });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

/** Public: đăng ký email ở trang chủ để nhận mã giảm giá chào mừng đơn hàng đầu tiên. */
export const requestWelcomeCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { email } = req.body;
		const result = await couponService.requestWelcomeCoupon(email);
		res.status(201).json({
			message: "Mã giảm giá đã được gửi đến email của bạn.",
			data: result,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
