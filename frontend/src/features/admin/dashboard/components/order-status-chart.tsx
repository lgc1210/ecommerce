import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import EChart from "./echart";
import { ORDER_STATUS_LABEL } from "../../order/utils";
import { ORDER_STATUS, type OrderStatus } from "../../../../shared/constants/order";

interface OrderStatusChartProps {
	ordersByStatus: Record<OrderStatus, number> | undefined;
	isLoading?: boolean;
}

/** Màu tương ứng với ORDER_STATUS_BADGE_CLASSNAME ở features/admin/order/utils, để đồng bộ màu badge trạng thái đơn trong toàn app. */
const STATUS_COLOR: Record<OrderStatus, string> = {
	[ORDER_STATUS.pending]: "#f59e0b",
	[ORDER_STATUS.processing]: "#3b82f6",
	[ORDER_STATUS.shipped]: "#8b5cf6",
	[ORDER_STATUS.delivered]: "#d9641f",
	[ORDER_STATUS.cancelled]: "#ef4444",
};

/** Biểu đồ tròn (donut) thể hiện tỷ trọng đơn hàng theo trạng thái, lấy từ DashboardOverview.ordersByStatus. */
const OrderStatusChart = ({ ordersByStatus, isLoading }: OrderStatusChartProps) => {
	const total = useMemo(() => Object.values(ordersByStatus ?? {}).reduce((sum, count) => sum + count, 0), [ordersByStatus]);

	const option = useMemo<EChartsOption>(() => {
		const statuses = Object.keys(ORDER_STATUS) as OrderStatus[];
		const data = statuses.map((status) => ({
			name: ORDER_STATUS_LABEL[status],
			value: ordersByStatus?.[status] ?? 0,
			itemStyle: { color: STATUS_COLOR[status] },
		}));

		return {
			tooltip: { trigger: "item", formatter: "{b}: {c} đơn ({d}%)" },
			legend: {
				bottom: 0,
				left: "center",
				itemWidth: 10,
				itemHeight: 10,
				textStyle: { color: "#1c1815", fontSize: 12 },
			},
			series: [
				{
					type: "pie",
					radius: ["55%", "78%"],
					center: ["50%", "44%"],
					avoidLabelOverlap: false,
					padAngle: 2,
					itemStyle: { borderRadius: 6 },
					label: { show: false },
					emphasis: { label: { show: true, fontSize: 16, fontWeight: "bold", formatter: "{c}" } },
					data,
				},
			],
		};
	}, [ordersByStatus]);

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<h3 className='text-base font-bold text-ink'>Đơn hàng theo trạng thái</h3>
			<p className='mt-0.5 text-xs text-muted'>Tổng {total} đơn hàng.</p>
			<EChart option={option} height={300} loading={isLoading} className='mt-2' />
		</div>
	);
};

export default OrderStatusChart;
