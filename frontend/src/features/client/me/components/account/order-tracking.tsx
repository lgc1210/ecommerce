import type { OrderStatus } from "../../../order/types";
import { BoxIcon, CheckIcon, ClockIcon, TruckIcon, XIcon } from "../../../../../components/icons";

const STEPS: { status: OrderStatus; label: string; icon: typeof ClockIcon }[] = [
	{ status: "pending", label: "Chờ xử lý", icon: ClockIcon },
	{ status: "processing", label: "Đang xử lý", icon: BoxIcon },
	{ status: "shipped", label: "Đang giao", icon: TruckIcon },
	{ status: "delivered", label: "Đã giao", icon: CheckIcon },
];

interface OrderTrackingProps {
	status: OrderStatus;
}

/**
 * Thanh tiến trình theo dõi đơn hàng, suy ra hoàn toàn từ "orderStatus" (backend
 * không có bảng lịch sử/tracking riêng — chỉ có 1 trường trạng thái duy nhất),
 * nên tối đa chỉ biết "đang ở bước nào", không biết chính xác thời điểm chuyển
 * từng bước trước đó.
 */
const OrderTracking = ({ status }: OrderTrackingProps) => {
	if (status === "cancelled") {
		return (
			<div className='flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600'>
				<XIcon className='h-5 w-5 shrink-0' />
				<span className='font-medium'>Đơn hàng này đã bị hủy.</span>
			</div>
		);
	}

	const currentIndex = STEPS.findIndex((step) => step.status === status);

	return (
		<div className='flex items-start'>
			{STEPS.map((step, index) => {
				const isDone = index < currentIndex;
				const isCurrent = index === currentIndex;
				const isActive = isDone || isCurrent;
				const Icon = step.icon;

				return (
					<div key={step.status} className='flex flex-1 flex-col items-center last:flex-none'>
						<div className='flex w-full items-center'>
							<div
								className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
									isActive ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted"
								}`}>
								<Icon className='h-4 w-4' />
							</div>
							{index < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 transition-colors ${index < currentIndex ? "bg-primary" : "bg-border"}`} />}
						</div>
						<span className={`mt-2 text-center text-xs font-semibold ${isActive ? "text-ink" : "text-muted"}`}>{step.label}</span>
					</div>
				);
			})}
		</div>
	);
};

export default OrderTracking;
