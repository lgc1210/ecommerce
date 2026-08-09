import { z } from "zod";
import { DiscountType } from "../../generated/prisma/index.js";
import { numericIdString } from "../../shared/validation.js";

const couponCodeRegex = /^[A-Za-z0-9_-]+$/;

// Chuỗi ngày giờ dạng ISO 8601, vd: "2026-08-01T00:00:00.000Z"
const isoDateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
	message: "Định dạng ngày giờ không hợp lệ (cần dạng ISO 8601).",
});

// ==========================================
// Public / Customer
// ==========================================
export const RequestWelcomeCouponSchema = z.object({
	body: z.object({
		email: z.email({ message: "Email không hợp lệ." }).max(255),
	}),
});

export const ValidateCouponSchema = z.object({
	body: z.object({
		code: z.string().min(1, { message: "Vui lòng nhập mã giảm giá." }).max(50),
		orderSubtotal: z.number().positive({ message: "Giá trị đơn hàng phải lớn hơn 0." }),
	}),
});

// ==========================================
// Admin
// ==========================================
export const ListCouponsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(50).optional(),
		isActive: z.enum(["true", "false"]).optional(),
		discountType: z.enum([DiscountType.fixed, DiscountType.percentage]).optional(),
	}),
});

export const CouponIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

const baseCouponBody = {
	code: z.string().min(3, { message: "Mã giảm giá phải có ít nhất 3 ký tự." }).max(50).regex(couponCodeRegex, {
		message: "Mã giảm giá chỉ được chứa chữ, số, gạch ngang và gạch dưới.",
	}),
	discountType: z.enum([DiscountType.fixed, DiscountType.percentage], {
		message: `Loại giảm giá phải là '${DiscountType.fixed}' hoặc '${DiscountType.percentage}'.`,
	}),
	discountValue: z.number().positive({ message: "Giá trị giảm giá phải lớn hơn 0." }),
	minOrderValue: z.number().min(0, { message: "Giá trị đơn hàng tối thiểu không được âm." }).optional(),
	maxDiscountValue: z.number().positive({ message: "Mức giảm tối đa phải lớn hơn 0." }).nullable().optional(),
	startsAt: isoDateTimeSchema,
	expiresAt: isoDateTimeSchema,
	usageLimit: z.number().int().positive({ message: "Giới hạn lượt dùng phải lớn hơn 0." }).nullable().optional(),
	isActive: z.boolean().optional(),
};

export const CreateCouponSchema = z.object({
	body: z
		.object(baseCouponBody)
		.refine((data) => data.discountType !== DiscountType.percentage || data.discountValue <= 100, {
			message: "Giảm giá theo % không được vượt quá 100.",
			path: ["discountValue"],
		})
		.refine((data) => new Date(data.expiresAt) > new Date(data.startsAt), {
			message: "Ngày hết hạn phải sau ngày bắt đầu.",
			path: ["expiresAt"],
		}),
});

export const UpdateCouponSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			code: baseCouponBody.code.optional(),
			discountType: baseCouponBody.discountType.optional(),
			discountValue: baseCouponBody.discountValue.optional(),
			minOrderValue: baseCouponBody.minOrderValue,
			maxDiscountValue: baseCouponBody.maxDiscountValue,
			startsAt: baseCouponBody.startsAt.optional(),
			expiresAt: baseCouponBody.expiresAt.optional(),
			usageLimit: baseCouponBody.usageLimit,
			isActive: baseCouponBody.isActive,
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." })
		.refine((data) => data.discountType !== DiscountType.percentage || data.discountValue === undefined || data.discountValue <= 100, {
			message: "Giảm giá theo % không được vượt quá 100.",
			path: ["discountValue"],
		})
		.refine((data) => !data.startsAt || !data.expiresAt || new Date(data.expiresAt) > new Date(data.startsAt), {
			message: "Ngày hết hạn phải sau ngày bắt đầu.",
			path: ["expiresAt"],
		}),
});
