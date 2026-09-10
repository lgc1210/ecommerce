import { DiscountType } from "../../generated/prisma/index.js";
/** Chuẩn hóa mã coupon: viết hoa, bỏ khoảng trắng thừa 2 đầu, vd: " sale10 " -> "SALE10" */
export declare function normalizeCouponCode(code: string): string;
/** Chuẩn hóa email: bỏ khoảng trắng thừa, viết thường, để so sánh/tra cứu nhất quán. */
export declare function normalizeEmail(email: string): string;
/** Sinh mã coupon "chào mừng đơn hàng đầu tiên" ngẫu nhiên dạng WELCOMEFIRST + 8 ký tự hex viết hoa. */
export declare function generateWelcomeCouponCode(): string;
/**
 * Coupon bị giới hạn theo email (coupon.email khác null) chỉ được dùng bởi tài khoản đăng nhập có
 * email trùng khớp (so sánh không phân biệt hoa/thường). Coupon thường (email = null) thì ai cũng dùng được.
 */
export declare function checkCouponEmailOwnership(couponEmail: string | null, userEmail?: string | null): boolean;
export interface CouponLike {
    discountType: DiscountType;
    discountValue: unknown;
    maxDiscountValue: unknown | null;
    minOrderValue: unknown;
    startsAt: Date;
    expiresAt: Date;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}
/** Kiểm tra coupon còn hiệu lực để sử dụng tại thời điểm hiện tại (chưa xét đến subtotal đơn hàng) */
export declare function checkCouponUsability(coupon: CouponLike, now?: Date): {
    valid: boolean;
    reason?: string;
};
/** Tính số tiền được giảm dựa trên loại giảm giá (fixed/percentage), có áp trần maxDiscountValue nếu có */
export declare function computeDiscountAmount(coupon: CouponLike, orderSubtotal: number): number;
//# sourceMappingURL=coupon.utils.d.ts.map