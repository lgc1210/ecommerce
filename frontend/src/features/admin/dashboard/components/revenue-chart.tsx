import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import EChart from "./echart";
import FormSelect from "../../../../components/form-select";
import { useDashboardRevenueSeriesQuery } from "../hooks";
import type { RevenuePeriod } from "../types";
import { formatBucketLabel, formatCompactCurrency, REVENUE_PERIOD_OPTIONS } from "../utils";
import { formatCurrency } from "../../../../utils/currency";

interface RevenueChartProps {
	period: RevenuePeriod;
	onChangePeriod: (period: RevenuePeriod) => void;
}

/**
 * Biểu đồ doanh thu theo thời gian: cột = doanh thu (trục trái), đường = số đơn thanh toán
 * thành công (trục phải). Dữ liệu từ GET /dashboard/revenue, đã được backend điền 0 cho các
 * khoảng không có giao dịch (buildRevenueBuckets) nên trục hoành luôn liên tục, không bị hụt điểm.
 */
const RevenueChart = ({ period, onChangePeriod }: RevenueChartProps) => {
	const { data, isLoading, isFetching } = useDashboardRevenueSeriesQuery(period);

	const option = useMemo<EChartsOption>(() => {
		const buckets = data?.buckets ?? [];
		const labels = buckets.map((b) => formatBucketLabel(b.label, period));
		const revenues = buckets.map((b) => b.revenue);
		const orders = buckets.map((b) => b.orders);

		return {
			color: ["#d9641f", "#1c1815"],
			grid: { left: 8, right: 8, top: 36, bottom: 8, containLabel: true },
			legend: { data: ["Doanh thu", "Số đơn"], top: 0, textStyle: { color: "#1c1815" } },
			tooltip: {
				trigger: "axis",
				axisPointer: { type: "shadow" },
				formatter: (params) => {
					const list = (Array.isArray(params) ? params : [params]) as Array<{
						axisValue?: string;
						marker?: string;
						seriesName?: string;
						value?: number | number[];
					}>;
					const title = list[0]?.axisValue ?? "";
					const lines = list.map((p) => {
						const value = Array.isArray(p.value) ? p.value[1] : p.value;
						const text = p.seriesName === "Doanh thu" ? formatCurrency(Number(value)) : `${value} đơn`;
						return `${p.marker ?? ""}${p.seriesName}: <strong>${text}</strong>`;
					});
					return [title, ...lines].join("<br/>");
				},
			},
			xAxis: {
				type: "category",
				data: labels,
				axisLine: { lineStyle: { color: "#e8e0d4" } },
				axisLabel: { color: "#948a7c" },
			},
			yAxis: [
				{
					type: "value",
					name: "Doanh thu",
					axisLabel: { color: "#948a7c", formatter: (v: number) => formatCompactCurrency(v) },
					splitLine: { lineStyle: { color: "#f3ede4" } },
				},
				{
					type: "value",
					name: "Số đơn",
					axisLabel: { color: "#948a7c" },
					splitLine: { show: false },
					minInterval: 1,
				},
			],
			series: [
				{
					name: "Doanh thu",
					type: "bar",
					yAxisIndex: 0,
					barMaxWidth: 28,
					itemStyle: { borderRadius: [4, 4, 0, 0] },
					data: revenues,
				},
				{
					name: "Số đơn",
					type: "line",
					yAxisIndex: 1,
					smooth: true,
					symbolSize: 6,
					data: orders,
				},
			],
		};
	}, [data, period]);

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h3 className='text-base font-bold text-ink'>Doanh thu theo thời gian</h3>
					<p className='mt-0.5 text-xs text-muted'>Chỉ tính các thanh toán đã hoàn tất.</p>
				</div>
				<FormSelect
					size='sm'
					value={period}
					onChange={(e) => onChangePeriod(e.target.value as RevenuePeriod)}
					options={REVENUE_PERIOD_OPTIONS}
				/>
			</div>
			<EChart option={option} loading={isLoading || isFetching} className='mt-2' />
		</div>
	);
};

export default RevenueChart;
