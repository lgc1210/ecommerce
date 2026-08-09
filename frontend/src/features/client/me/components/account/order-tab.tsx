import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMyOrdersQuery } from "../../../order/hooks";
import OrderDetail from "./order-detail";
import { formatCurrency } from "../../../../../utils/currency";
import OrderStatusBadge from "../../../../admin/order/components/order-status-badge";
import Pagination from "../../../../../components/pagination";
import { BoxIcon } from "../../../../../components/icons";
import { formatDate } from "../../../../../utils";

const PAGE_SIZE = 10;

/**
 * Tab "Đơn hàng" trong trang tài khoản — dùng GET /orders/me (self-service,
 * chỉ cần đăng nhập, khớp với permission "order:read" backend đã cấp cho role
 * "customer"). Click vào 1 đơn sẽ chuyển sang OrderDetail (kèm tracking) ngay
 * trong cùng tab, dùng state cục bộ `selectedOrderId` thay vì điều hướng route
 * riêng để giữ trải nghiệm gói gọn trong trang tài khoản.
 */
const OrdersTab = () => {
	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || PAGE_SIZE;

	const { data, isLoading } = useMyOrdersQuery({ page, limit });
	const orders = data?.data ?? [];

	if (selectedOrderId !== null) {
		return <OrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
	}

	if (isLoading) {
		return <p className='py-8 text-center text-sm text-muted'>Đang tải...</p>;
	}

	if (orders.length === 0) {
		return (
			<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
				<BoxIcon className='mx-auto mb-2 h-6 w-6 text-muted' />
				Bạn chưa có đơn hàng nào.
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			<div className='space-y-3'>
				{orders.map((order) => (
					<button
						key={order.id}
						type='button'
						onClick={() => setSelectedOrderId(order.id)}
						className='flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-primary'>
						<div>
							<p className='font-semibold text-ink'>{order.orderNumber}</p>
							<p className='mt-1 text-xs text-muted'>
								Đặt lúc {formatDate(order.createdAt)} · {order._count.items} sản phẩm
							</p>
						</div>
						<div className='flex items-center gap-4'>
							<p className='font-bold text-primary-dark'>{formatCurrency(Number(order.totalAmount))}</p>
							<OrderStatusBadge status={order.orderStatus} />
						</div>
					</button>
				))}
			</div>

			{data && <Pagination total={data.pagination.total} defaultLimit={PAGE_SIZE} pageSizeOptions={[]} isLoading={isLoading} />}
		</div>
	);
};

export default OrdersTab;
