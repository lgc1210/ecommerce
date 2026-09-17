export type DurationUnitValue = "day" | "month" | "year";

// Quy đổi tương đối, chỉ dùng để SO SÁNH độ dài giữa 2 khoảng thời gian khác đơn vị
// (vd: 7 ngày vs 12 tháng) — KHÔNG dùng để tính ngày hết hạn thực tế, nơi đó phải cộng
// trực tiếp theo lịch thật (xem calculateWarrantyEndDate ở service claim, Phase 2).
const DURATION_UNIT_TO_APPROX_DAYS: Record<DurationUnitValue, number> = {
	day: 1,
	month: 30,
	year: 365,
};

export function toApproxDays(value: number, unit: DurationUnitValue): number {
	return value * DURATION_UNIT_TO_APPROX_DAYS[unit];
}

/**
 * Đảm bảo giai đoạn "đổi mới 1-đổi-1" (nếu có khai báo) không dài hơn tổng thời hạn bảo hành.
 * Nhận null cho cả 2 tham số exchangePeriod* khi chính sách không áp dụng đổi mới.
 */
export function assertExchangePeriodWithinDuration(
	durationValue: number,
	durationUnit: DurationUnitValue,
	exchangePeriodValue: number | null,
	exchangePeriodUnit: DurationUnitValue | null,
): void {
	if (exchangePeriodValue === null || exchangePeriodUnit === null) return;

	const exchangeDays = toApproxDays(exchangePeriodValue, exchangePeriodUnit);
	const totalDays = toApproxDays(durationValue, durationUnit);

	if (exchangeDays > totalDays) {
		throw new Error("BadRequest: Thời gian đổi mới 1 đổi 1 không được dài hơn tổng thời hạn bảo hành.");
	}
}

/**
 * Cộng (value, unit) vào 1 ngày THEO LỊCH THẬT (không quy đổi gần đúng) — dùng để tính
 * warrantyEndAt thực tế, khác hẳn toApproxDays() ở trên (chỉ dùng để SO SÁNH độ dài).
 *
 * Lưu ý hành vi gốc của JS Date.setMonth/setFullYear khi ngày bắt đầu là cuối tháng: vd
 * 31/01 + 1 tháng -> JS tự "tràn" sang 02/03 hoặc 03/03 (vì tháng 2 không có ngày 31), KHÔNG
 * lùi về 28/02. Đây là hành vi chuẩn của JS Date, không phải bug — chấp nhận được cho bài toán
 * tính hạn bảo hành (sai lệch tối đa vài ngày trong trường hợp hiếm), không dùng thư viện ngày
 * tháng ngoài (date-fns...) chỉ để xử lý case hiếm này, tránh thêm dependency không cần thiết.
 */
export function addCalendarDuration(date: Date, value: number, unit: DurationUnitValue): Date {
	const result = new Date(date);
	if (unit === "day") {
		result.setDate(result.getDate() + value);
	} else if (unit === "month") {
		result.setMonth(result.getMonth() + value);
	} else {
		result.setFullYear(result.getFullYear() + value);
	}
	return result;
}

/** Tính ngày hết hạn bảo hành thực tế = ngày giao hàng + thời hạn chính sách (theo lịch thật). */
export function calculateWarrantyEndDate(
	deliveredAt: Date,
	durationValue: number,
	durationUnit: DurationUnitValue,
): Date {
	return addCalendarDuration(deliveredAt, durationValue, durationUnit);
}

/** Sinh mã claim hiển thị cho khách, vd: WR-20260910-4821 — không đảm bảo unique tuyệt đối,
 * nơi gọi phải tự kiểm tra trùng và thử lại (xem warranty-claim.service.ts). */
export function generateClaimNumber(now: Date = new Date()): string {
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
	const randomPart = Math.floor(1000 + Math.random() * 9000);
	return `WR-${datePart}-${randomPart}`;
}

// ==========================================
// State machine trạng thái claim (Phase 3 — xử lý của staff)
// ==========================================

export type WarrantyClaimStatusValue = "pending" | "approved" | "rejected" | "in_repair" | "completed" | "cancelled";

/** "completed"/"rejected"/"cancelled" là trạng thái cuối, không đổi được nữa — giống hệt cách
 * ALLOWED_TRANSITIONS được thiết kế cho OrderStatus ở order.utils.ts. */
const ALLOWED_CLAIM_TRANSITIONS: Record<WarrantyClaimStatusValue, WarrantyClaimStatusValue[]> = {
	pending: ["approved", "rejected", "cancelled"],
	approved: ["in_repair", "rejected", "cancelled"],
	in_repair: ["completed", "rejected"],
	completed: [],
	rejected: [],
	cancelled: [],
};

export function isValidWarrantyClaimStatusTransition(
	current: WarrantyClaimStatusValue,
	next: WarrantyClaimStatusValue,
): boolean {
	if (current === next) return true;
	return ALLOWED_CLAIM_TRANSITIONS[current]?.includes(next) ?? false;
}

// Số ngày làm việc mặc định để xử lý 1 claim sau khi được duyệt — dùng tính slaDueAt. Đặt hằng số
// ở đây (thay vì hardcode trong service) để sau này dễ chuyển thành cấu hình theo từng policy/SKU
// nếu nghiệp vụ cần SLA khác nhau theo loại sản phẩm.
export const CLAIM_SLA_DAYS_AFTER_APPROVAL = 3;

export function calculateClaimSlaDueDate(approvedAt: Date = new Date()): Date {
	return addCalendarDuration(approvedAt, CLAIM_SLA_DAYS_AFTER_APPROVAL, "day");
}
