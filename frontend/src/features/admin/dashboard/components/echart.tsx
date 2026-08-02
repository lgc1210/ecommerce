import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import Skeleton from "./skeleton";

interface EChartProps {
	option: EChartsOption;
	height?: number;
	className?: string;
	/** Đè skeleton lên biểu đồ cũ (không unmount) trong lúc tải/refetch (đổi period, limit...). */
	loading?: boolean;
}

/** Vài thanh cao thấp xen kẽ mô phỏng hình dạng biểu đồ, dùng cho overlay skeleton của EChart. */
const ChartBarsSkeleton = () => (
	<div className='flex h-full w-full items-end gap-3 px-2 pb-6'>
		{[55, 80, 40, 95, 65, 50, 85, 35, 70, 45].map((h, i) => (
			<Skeleton key={i} className='flex-1 rounded-t-md rounded-b-none' style={{ height: `${h}%` }} />
		))}
	</div>
);

/**
 * Wrapper dùng chung cho mọi biểu đồ ECharts trong dashboard. Tự khởi tạo instance 1 lần,
 * chỉ setOption lại khi `option` đổi (không recreate DOM), và tự resize theo kích thước
 * container qua ResizeObserver — cần thiết vì layout admin có sidebar thu/phóng làm thay
 * đổi bề rộng khu vực nội dung mà không kèm theo sự kiện resize của window.
 *
 * Khi `loading`, phủ 1 lớp skeleton (dạng thanh cột mờ) đè lên canvas cũ thay vì dùng
 * spinner mặc định của ECharts, để đồng bộ hiệu ứng skeleton với các card khác trên dashboard.
 */
const EChart = ({ option, height = 320, className = "", loading = false }: EChartProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const chart = echarts.init(containerRef.current);
		chartRef.current = chart;

		const resizeObserver = new ResizeObserver(() => chart.resize());
		resizeObserver.observe(containerRef.current);

		return () => {
			resizeObserver.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, []);

	useEffect(() => {
		chartRef.current?.setOption(option, true);
	}, [option]);

	return (
		<div className={`relative ${className}`} style={{ height, width: "100%" }}>
			<div ref={containerRef} className='h-full w-full' />
			{loading && (
				<div className='absolute inset-0 rounded-xl bg-surface'>
					<ChartBarsSkeleton />
				</div>
			)}
		</div>
	);
};

export default EChart;
