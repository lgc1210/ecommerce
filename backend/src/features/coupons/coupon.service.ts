import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { DISCOUNT_TYPE } from "./coupon.constant.js";
import { normalizeCouponCode, checkCouponUsability, computeDiscountAmount } from "./coupon.utils.js";

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

interface CreateCouponInput {
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

interface UpdateCouponInput {
	code?: string;
	discountType?: DiscountType;
	discountValue?: number;
	minOrderValue?: number;
	maxDiscountValue?: number | null;
	startsAt?: string;
	expiresAt?: string;
	usageLimit?: number | null;
	isActive?: boolean;
}

interface ListCouponsParams {
	page?: string;
	limit?: string;
	search?: string;
	isActive?: string;
	discountType?: string;
}

class CouponService {
	// ==========================================
	// Admin
	// ==========================================
	async listCoupons(params: ListCouponsParams) {
		const where: Record<string, unknown> = {};

		if (params.search) where.code = { contains: normalizeCouponCode(params.search) };
		if (params.isActive !== undefined) where.isActive = params.isActive === "true";
		if (params.discountType) where.discountType = params.discountType;

		const { page, limit, skip } = parsePagination(params);
		const [coupons, total] = await Promise.all([
			prisma.coupon.findMany({ where, orderBy: { id: "desc" }, skip, take: limit }),
			prisma.coupon.count({ where }),
		]);

		return {
			data: coupons,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getCouponById(id: number) {
		const coupon = await prisma.coupon.findUnique({ where: { id } });
		if (!coupon) {
			throw new Error("NotFound: Mã giảm giá không tồn tại.");
		}
		return coupon;
	}

	async createCoupon(data: CreateCouponInput) {
		const code = normalizeCouponCode(data.code);

		const existing = await prisma.coupon.findUnique({ where: { code } });
		if (existing) {
			throw new Error("Conflict: Mã giảm giá này đã tồn tại.");
		}

		return prisma.coupon.create({
			data: {
				code,
				discountType: data.discountType,
				discountValue: data.discountValue,
				minOrderValue: data.minOrderValue ?? 0,
				maxDiscountValue: data.maxDiscountValue ?? null,
				startsAt: new Date(data.startsAt),
				expiresAt: new Date(data.expiresAt),
				usageLimit: data.usageLimit ?? null,
				isActive: data.isActive ?? true,
			},
		});
	}

	async updateCoupon(id: number, data: UpdateCouponInput) {
		const existing = await this.getCouponById(id);

		const updateData: Record<string, unknown> = {};

		if (data.code !== undefined && normalizeCouponCode(data.code) !== existing.code) {
			const code = normalizeCouponCode(data.code);
			const codeOwner = await prisma.coupon.findUnique({ where: { code } });
			if (codeOwner) {
				throw new Error("Conflict: Mã giảm giá này đã tồn tại.");
			}
			updateData.code = code;
		}

		if (data.discountType !== undefined) updateData.discountType = data.discountType;
		if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
		if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue;
		if (data.maxDiscountValue !== undefined) updateData.maxDiscountValue = data.maxDiscountValue;
		if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
		if (data.expiresAt !== undefined) updateData.expiresAt = new Date(data.expiresAt);
		if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
		if (data.isActive !== undefined) updateData.isActive = data.isActive;

		// Ráp dữ liệu mới đè lên dữ liệu hiện có để validate tính nhất quán tổng thể,
		// tránh trường hợp chỉ sửa 1 phần (vd: chỉ đổi discountValue) làm coupon rơi vào trạng thái vô lý.
		const merged = {
			discountType: (data.discountType ?? existing.discountType) as DiscountType,
			discountValue: Number(data.discountValue ?? existing.discountValue),
			startsAt: data.startsAt !== undefined ? new Date(data.startsAt) : existing.startsAt,
			expiresAt: data.expiresAt !== undefined ? new Date(data.expiresAt) : existing.expiresAt,
		};

		if (merged.discountType === DISCOUNT_TYPE.percentage && merged.discountValue > 100) {
			throw new Error("BadRequest: Giảm giá theo % không được vượt quá 100.");
		}
		if (merged.expiresAt <= merged.startsAt) {
			throw new Error("BadRequest: Ngày hết hạn phải sau ngày bắt đầu.");
		}

		return prisma.coupon.update({ where: { id }, data: updateData });
	}

	async deleteCoupon(id: number) {
		const coupon = await prisma.coupon.findUnique({
			where: { id },
			include: { _count: { select: { orders: true } } },
		});

		if (!coupon) {
			throw new Error("NotFound: Mã giảm giá không tồn tại.");
		}

		if (coupon._count.orders > 0) {
			throw new Error(
				"Conflict: Không thể xóa mã giảm giá đã được sử dụng trong đơn hàng. Hãy vô hiệu hóa (isActive=false) thay vì xóa.",
			);
		}

		await prisma.coupon.delete({ where: { id } });
	}

	// ==========================================
	// Public / Customer
	// ==========================================
	/** Kiểm tra mã giảm giá có áp dụng được cho 1 đơn hàng cụ thể không, trả về số tiền được giảm nếu hợp lệ */
	async validateCoupon(code: string, orderSubtotal: number) {
		const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCouponCode(code) } });
		if (!coupon) {
			throw new Error("NotFound: Mã giảm giá không tồn tại.");
		}

		const usability = checkCouponUsability(coupon);
		if (!usability.valid) {
			throw new Error(`BadRequest: ${usability.reason}`);
		}

		if (orderSubtotal < Number(coupon.minOrderValue)) {
			throw new Error(
				`BadRequest: Đơn hàng tối thiểu ${Number(coupon.minOrderValue).toLocaleString("vi-VN")}đ để áp dụng mã này.`,
			);
		}

		const discountAmount = computeDiscountAmount(coupon, orderSubtotal);

		return {
			couponId: coupon.id,
			code: coupon.code,
			discountAmount,
			finalAmount: orderSubtotal - discountAmount,
		};
	}

	/**
	 * Tăng usedCount thêm 1 sau khi đơn hàng áp dụng coupon được đặt/thanh toán thành công.
	 * Được thiết kế để feature "orders" (chưa triển khai) gọi lại trong luồng tạo đơn hàng, không expose qua route riêng.
	 */
	async incrementUsage(couponId: number) {
		await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
	}
}

export default new CouponService();
