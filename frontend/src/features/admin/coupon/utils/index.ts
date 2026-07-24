import type { AdminCoupon, DiscountType } from "../types";
import { COUPON_DISPLAY_STATUS } from "../consts";

export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
	fixed: "Số tiền cố định",
	percentage: "Phần trăm",
};

export type CouponDisplayStatus = (typeof COUPON_DISPLAY_STATUS)[keyof typeof COUPON_DISPLAY_STATUS];

export const COUPON_STATUS_LABEL: Record<CouponDisplayStatus, string> = {
	active: "Đang hoạt động",
	inactive: "Đã vô hiệu hóa",
	scheduled: "Chưa bắt đầu",
	expired: "Đã hết hạn",
	used_up: "Hết lượt dùng",
};

export const COUPON_STATUS_BADGE_CLASSNAME: Record<CouponDisplayStatus, string> = {
	active: "bg-primary-light text-primary-dark",
	inactive: "bg-ink/10 text-ink/60",
	scheduled: "bg-blue-50 text-blue-600",
	expired: "bg-ink/10 text-ink/60",
	used_up: "bg-amber-50 text-amber-600",
};

/**
 * Trạng thái hiển thị của coupon, mirror logic checkCouponUsability ở backend
 * (coupon.utils.ts) nhưng chỉ để tô màu badge — không dùng để chặn hành động gì
 * ở FE, vì việc coupon còn áp dụng được hay không do backend quyết định thật sự
 * khi khách bấm "Áp dụng mã" lúc thanh toán.
 */
export function getCouponDisplayStatus(coupon: AdminCoupon, now: Date = new Date()): CouponDisplayStatus {
	if (!coupon.isActive) return COUPON_DISPLAY_STATUS.inactive;
	if (now < new Date(coupon.startsAt)) return COUPON_DISPLAY_STATUS.scheduled;
	if (now > new Date(coupon.expiresAt)) return COUPON_DISPLAY_STATUS.expired;
	if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return COUPON_DISPLAY_STATUS.used_up;
	return COUPON_DISPLAY_STATUS.active;
}

/** ISO datetime (UTC, từ backend) -> giá trị hiển thị cho <input type="datetime-local"> (giờ địa phương của trình duyệt). */
export function toDatetimeLocalValue(isoString: string): string {
	const date = new Date(isoString);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Giá trị từ <input type="datetime-local"> -> chuỗi ISO 8601 UTC để gửi lên backend (khớp isoDateTimeSchema). */
export function fromDatetimeLocalValue(value: string): string {
	return new Date(value).toISOString();
}
