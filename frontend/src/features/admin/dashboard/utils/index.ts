import type { RevenuePeriod } from "../types";

export const REVENUE_PERIOD_LABEL: Record<RevenuePeriod, string> = {
	"7d": "7 ngày qua",
	"30d": "30 ngày qua",
	"12m": "12 tháng qua",
};

export const REVENUE_PERIOD_OPTIONS = (Object.keys(REVENUE_PERIOD_LABEL) as RevenuePeriod[]).map((value) => ({
	value,
	label: REVENUE_PERIOD_LABEL[value],
}));

/**
 * Format nhãn 1 điểm dữ liệu trên trục hoành của biểu đồ doanh thu. Bucket.label ở dạng
 * "YYYY-MM-DD" (period 7d/30d) hoặc "YYYY-MM" (period 12m) — xem buildRevenueBuckets ở backend.
 */
export const formatBucketLabel = (label: string, period: RevenuePeriod): string => {
	if (period === "12m") {
		const [year, month] = label.split("-");
		return `Th${Number(month)}/${year.slice(2)}`;
	}
	const [, month, day] = label.split("-");
	return `${day}/${month}`;
};

/** Rút gọn số tiền lớn cho trục biểu đồ (vd. 12.500.000 -> "12,5tr"), tránh trục dài chồng chữ. */
export const formatCompactCurrency = (value: number): string => {
	if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}tỷ`;
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
	return `${value}`;
};

/** Format % tăng trưởng kèm dấu +/-, trả về null nếu không tính được (xem computeGrowthPercent ở backend). */
export const formatGrowthPercent = (value: number | null): string | null => {
	if (value === null) return null;
	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(1)}%`;
};
