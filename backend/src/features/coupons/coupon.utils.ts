import crypto from "crypto";
import { WELCOME_COUPON } from "./coupon.constant.js";
import { DiscountType } from "../../generated/prisma/index.js";

/** Chuẩn hóa mã coupon: viết hoa, bỏ khoảng trắng thừa 2 đầu, vd: " sale10 " -> "SALE10" */
export function normalizeCouponCode(code: string): string {
	return code.trim().toUpperCase();
}

/** Chuẩn hóa email: bỏ khoảng trắng thừa, viết thường, để so sánh/tra cứu nhất quán. */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/** Sinh mã coupon "chào mừng đơn hàng đầu tiên" ngẫu nhiên dạng WELCOMEFIRST + 8 ký tự hex viết hoa. */
export function generateWelcomeCouponCode(): string {
	const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
	return `${WELCOME_COUPON.codePrefix}${suffix}`;
}

/**
 * Coupon bị giới hạn theo email (coupon.email khác null) chỉ được dùng bởi tài khoản đăng nhập có
 * email trùng khớp (so sánh không phân biệt hoa/thường). Coupon thường (email = null) thì ai cũng dùng được.
 */
export function checkCouponEmailOwnership(couponEmail: string | null, userEmail?: string | null): boolean {
	if (!couponEmail) return true;
	if (!userEmail) return false;
	return normalizeEmail(couponEmail) === normalizeEmail(userEmail);
}

export interface CouponLike {
	discountType: DiscountType;
	discountValue: unknown; // Prisma Decimal
	maxDiscountValue: unknown | null; // Prisma Decimal | null
	minOrderValue: unknown; // Prisma Decimal
	startsAt: Date;
	expiresAt: Date;
	usageLimit: number | null;
	usedCount: number;
	isActive: boolean;
}

/** Kiểm tra coupon còn hiệu lực để sử dụng tại thời điểm hiện tại (chưa xét đến subtotal đơn hàng) */
export function checkCouponUsability(coupon: CouponLike, now: Date = new Date()): { valid: boolean; reason?: string } {
	if (!coupon.isActive) {
		return { valid: false, reason: "Mã giảm giá hiện không còn hoạt động." };
	}
	if (now < coupon.startsAt) {
		return { valid: false, reason: "Mã giảm giá chưa đến thời gian áp dụng." };
	}
	if (now > coupon.expiresAt) {
		return { valid: false, reason: "Mã giảm giá đã hết hạn." };
	}
	if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
		return { valid: false, reason: "Mã giảm giá đã hết lượt sử dụng." };
	}
	return { valid: true };
}

/** Tính số tiền được giảm dựa trên loại giảm giá (fixed/percentage), có áp trần maxDiscountValue nếu có */
export function computeDiscountAmount(coupon: CouponLike, orderSubtotal: number): number {
	const discountValue = Number(coupon.discountValue);
	const maxDiscountValue = coupon.maxDiscountValue !== null ? Number(coupon.maxDiscountValue) : null;

	let discount: number;
	if (coupon.discountType === DiscountType.fixed) {
		discount = discountValue;
	} else {
		discount = (orderSubtotal * discountValue) / 100;
		if (maxDiscountValue !== null) {
			discount = Math.min(discount, maxDiscountValue);
		}
	}

	// Số tiền giảm không bao giờ được vượt quá giá trị đơn hàng
	return Math.min(discount, orderSubtotal);
}
