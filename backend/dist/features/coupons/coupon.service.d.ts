import type { CreateCouponInput, ListCouponsParams, UpdateCouponInput } from "./coupon.validation.js";
declare class CouponService {
    listCoupons(params: ListCouponsParams): Promise<{
        data: {
            email: string | null;
            id: number;
            isActive: boolean;
            expiresAt: Date;
            code: string;
            discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
            discountValue: import("@prisma/client-runtime-utils").Decimal;
            minOrderValue: import("@prisma/client-runtime-utils").Decimal;
            maxDiscountValue: import("@prisma/client-runtime-utils").Decimal | null;
            startsAt: Date;
            usageLimit: number | null;
            usedCount: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCouponById(id: number): Promise<{
        email: string | null;
        id: number;
        isActive: boolean;
        expiresAt: Date;
        code: string;
        discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscountValue: import("@prisma/client-runtime-utils").Decimal | null;
        startsAt: Date;
        usageLimit: number | null;
        usedCount: number;
    }>;
    createCoupon(data: CreateCouponInput): Promise<{
        email: string | null;
        id: number;
        isActive: boolean;
        expiresAt: Date;
        code: string;
        discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscountValue: import("@prisma/client-runtime-utils").Decimal | null;
        startsAt: Date;
        usageLimit: number | null;
        usedCount: number;
    }>;
    updateCoupon(id: number, data: UpdateCouponInput): Promise<{
        email: string | null;
        id: number;
        isActive: boolean;
        expiresAt: Date;
        code: string;
        discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
        discountValue: import("@prisma/client-runtime-utils").Decimal;
        minOrderValue: import("@prisma/client-runtime-utils").Decimal;
        maxDiscountValue: import("@prisma/client-runtime-utils").Decimal | null;
        startsAt: Date;
        usageLimit: number | null;
        usedCount: number;
    }>;
    deleteCoupon(id: number): Promise<void>;
    /**
     * Kiểm tra mã giảm giá có áp dụng được cho 1 đơn hàng cụ thể không, trả về số tiền được giảm nếu hợp lệ.
     * `userEmail`: email tài khoản đang thực hiện thao tác — bắt buộc phải trùng với coupon.email nếu
     * coupon đó bị giới hạn theo email (vd: coupon chào mừng đơn hàng đầu tiên).
     */
    validateCoupon(code: string, orderSubtotal: number, userEmail?: string | null): Promise<{
        couponId: number;
        code: string;
        discountAmount: number;
        finalAmount: number;
    }>;
    /**
     * Tăng usedCount thêm 1 sau khi đơn hàng áp dụng coupon được đặt/thanh toán thành công.
     * Được thiết kế để feature "orders" (chưa triển khai) gọi lại trong luồng tạo đơn hàng, không expose qua route riêng.
     */
    incrementUsage(couponId: number): Promise<void>;
    /**
     * Form đăng ký email ở trang chủ ("Đăng ký nhận ưu đãi 25% cho đơn hàng đầu tiên"): tạo 1 coupon
     * WELCOMEFIRST... gắn riêng cho email đó, lưu vào bảng coupons để validate lúc thanh toán, và gửi
     * mã qua email. Mỗi email chỉ được cấp 1 lần (email là @unique ở DB).
     */
    requestWelcomeCoupon(rawEmail: string): Promise<{
        email: string | null;
        code: string;
        expiresAt: Date;
    }>;
    private sendWelcomeCouponEmail;
}
declare const _default: CouponService;
export default _default;
//# sourceMappingURL=coupon.service.d.ts.map