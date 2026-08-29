import type { DiscountType } from "../../../../shared/constants/coupon";
import type { Pagination } from "../../../../types";

/**
 * 1 mã giảm giá nhìn từ phía admin. Lưu ý: discountValue/minOrderValue/maxDiscountValue
 * là Prisma Decimal ở backend -> serialize qua JSON thành string (không phải number),
 * nên phải Number(...) trước khi tính toán/hiển thị.
 */
export interface AdminCoupon {
	id: number;
	code: string;
	discountType: DiscountType;
	discountValue: string;
	minOrderValue: string;
	maxDiscountValue: string | null;
	startsAt: string;
	expiresAt: string;
	usageLimit: number | null;
	usedCount: number;
	isActive: boolean;
}

export interface ListCouponsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
	discountType?: DiscountType;
}

export interface ListCouponsResult {
	data: AdminCoupon[];
	pagination: Pagination;
}

/** Payload gửi lên backend luôn dùng number (không phải string) cho các trường tiền/giá trị — khớp CreateCouponSchema/UpdateCouponSchema (z.number()). */
export interface CreateCouponPayload {
	code: string;
	discountType: DiscountType;
	discountValue: number;
	minOrderValue?: number;
	maxDiscountValue?: number | null;
	startsAt: string;
	expiresAt: string;
	usageLimit?: number | null;
	isActive?: boolean;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
	id: number;
}
