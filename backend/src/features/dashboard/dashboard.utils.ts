export type RevenuePeriod = "7d" | "30d" | "12m";

export interface PeriodRange {
	from: Date;
	to: Date;
	bucket: "day" | "month";
}

/** Tính khoảng thời gian + độ chia nhóm (theo ngày hay theo tháng) dựa trên period được chọn cho biểu đồ doanh thu */
export function getPeriodRange(period: RevenuePeriod, now: Date = new Date()): PeriodRange {
	if (period === "12m") {
		const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
		const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
		return { from, to, bucket: "month" };
	}

	const days = period === "7d" ? 7 : 30;
	const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
	const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
	return { from, to, bucket: "day" };
}

interface PaymentForBucket {
	amount: unknown; // Prisma.Decimal
	paidAt: Date | null;
}

/** Chia danh sách thanh toán đã hoàn tất thành các nhóm theo ngày/tháng, điền 0 cho những khoảng không có giao dịch */
export function buildRevenueBuckets(payments: PaymentForBucket[], range: PeriodRange): Array<{ label: string; revenue: number; orders: number }> {
	const key = (date: Date): string => (range.bucket === "day" ? date.toISOString().slice(0, 10) : date.toISOString().slice(0, 7));

	const totals = new Map<string, { revenue: number; orders: number }>();
	for (const payment of payments) {
		if (!payment.paidAt) continue;
		const bucketKey = key(payment.paidAt);
		const entry = totals.get(bucketKey) ?? { revenue: 0, orders: 0 };
		entry.revenue += Number(payment.amount);
		entry.orders += 1;
		totals.set(bucketKey, entry);
	}

	const buckets: Array<{ label: string; revenue: number; orders: number }> = [];
	const cursor = new Date(range.from);

	while (cursor <= range.to) {
		const bucketKey = key(cursor);
		const entry = totals.get(bucketKey) ?? { revenue: 0, orders: 0 };
		buckets.push({ label: bucketKey, revenue: entry.revenue, orders: entry.orders });

		if (range.bucket === "day") {
			cursor.setDate(cursor.getDate() + 1);
		} else {
			cursor.setMonth(cursor.getMonth() + 1);
		}
	}

	return buckets;
}

/** Tính % tăng trưởng so với kỳ trước. Trả null khi không thể tính (cả 2 kỳ đều bằng 0) để tránh chia cho 0. */
export function computeGrowthPercent(current: number, previous: number): number | null {
	if (previous === 0) {
		if (current === 0) return null;
		return 100;
	}
	return ((current - previous) / previous) * 100;
}
