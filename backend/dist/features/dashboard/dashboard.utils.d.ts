import { REVENUE_PERRIOD } from "./dashboard.constant.js";
export type RevenuePeriod = (typeof REVENUE_PERRIOD)[keyof typeof REVENUE_PERRIOD];
export interface PeriodRange {
    from: Date;
    to: Date;
    bucket: "day" | "month";
}
/** Tính khoảng thời gian + độ chia nhóm (theo ngày hay theo tháng) dựa trên period được chọn cho biểu đồ doanh thu */
export declare function getPeriodRange(period: RevenuePeriod, now?: Date): PeriodRange;
interface PaymentForBucket {
    amount: unknown;
    paidAt: Date | null;
}
/** Chia danh sách thanh toán đã hoàn tất thành các nhóm theo ngày/tháng, điền 0 cho những khoảng không có giao dịch */
export declare function buildRevenueBuckets(payments: PaymentForBucket[], range: PeriodRange): Array<{
    label: string;
    revenue: number;
    orders: number;
}>;
/** Tính % tăng trưởng so với kỳ trước. Trả null khi không thể tính (cả 2 kỳ đều bằng 0) để tránh chia cho 0. */
export declare function computeGrowthPercent(current: number, previous: number): number | null;
export {};
//# sourceMappingURL=dashboard.utils.d.ts.map