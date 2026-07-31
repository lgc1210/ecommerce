import { useState } from "react";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Pagination from "../../../components/pagination";
import AdminTitle from "../../../components/admin-title";
import { CloseIcon, SearchIcon } from "../../../components/icons";
import Button from "../../../components/button";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseEnumParam } from "../../../utils/searchParams";
import { formatCurrency } from "../../../utils/currency";
import { useOrdersAdminQuery } from "../../../features/admin/order/hooks";
import type { OrderStatus } from "../../../features/admin/order/types";
import { formatOrderDate, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "../../../features/admin/order/utils";
import PaymentStatusBadge from "../../../features/admin/order/components/payment-status-badge";
import OrderDetailModal from "../../../features/admin/order/components/order-detail-modal";
import OrderStatusBadge from "../../../features/admin/order/components/order-status-badge";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend, dẫn tới các trang
// "ảo" vượt quá dữ liệu thật (bấm vào sẽ trả về rỗng dù còn sản phẩm).
const PAGE_SIZE = 10;

/**
 * Trang quản trị Order. Route "/admin/order" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.order.update) (xem configs/routes/index.ts),
 * khớp với backend: cả 2 endpoint GET (list/detail) và endpoint PATCH đổi trạng
 * thái ở /orders/admin/* đều yêu cầu permission "order:update" (xem comment ở
 * order.routes.ts — CHỦ Ý không dùng "order:read" để tránh khách hàng thường lỡ
 * có quyền xem đơn của người khác).
 *
 * Phân trang + filter (search/status/khoảng ngày) lưu thẳng lên URL query string,
 * cùng pattern với trang Contact: reload/back-forward vẫn giữ đúng view, copy
 * link chia sẻ được.
 */
const AdminOrderPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } =
		useListQueryParams({
			defaultLimit: PAGE_SIZE,
		});

	const status = parseEnumParam<OrderStatus>(searchParams, "status");
	// dateFrom/dateTo giữ nguyên dạng chuỗi thô (không cần parser riêng) — chỉ convert sang ISO
	// ngay trước khi gọi API bên dưới.
	const dateFrom = searchParams.get("dateFrom") ?? "";
	const dateTo = searchParams.get("dateTo") ?? "";

	const { data, isLoading, isFetching } = useOrdersAdminQuery({
		page,
		limit,
		search,
		status,
		dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
		dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
	});

	const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

	const orders = data?.data ?? [];
	const pagination = data?.pagination;

	return (
		<div className='space-y-6'>
			<AdminTitle title='Đơn hàng' description='Xem và xử lý các đơn hàng khách đã đặt.' />

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo mã đơn, tên, email khách...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={status ?? ""}
					onChange={(e) => setFilter("status", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
				/>
				<FormControl
					type='date'
					value={dateFrom}
					onChange={(e) => setFilter("dateFrom", e.target.value || undefined)}
					wrapperClassName='w-40'
				/>
				<FormControl
					type='date'
					value={dateTo}
					onChange={(e) => setFilter("dateTo", e.target.value || undefined)}
					wrapperClassName='w-40'
				/>
				{hasActiveFilters(["status", "dateFrom", "dateTo"]) && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={clearFilters}
						icon={<CloseIcon className='h-4 w-4' />}
						iconPosition='left'
						className='gap-1.5! bg-transparent! px-0! my-auto text-muted! hover:text-ink!'>
						Xoá bộ lọc
					</Button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-200 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Mã đơn</th>
							<th className='px-5 py-3.5'>Khách hàng</th>
							<th className='px-5 py-3.5'>Thanh toán</th>
							<th className='px-5 py-3.5'>Tổng tiền</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5'>Ngày đặt</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : orders.length === 0 ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy đơn hàng nào.
								</td>
							</tr>
						) : (
							orders.map((order) => (
								<tr
									key={order.id}
									onClick={() => setSelectedOrderId(order.id)}
									className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5'>
										<p className='font-semibold text-ink'>{order.orderNumber}</p>
										<p className='text-xs text-muted'>{order._count.items} sản phẩm</p>
									</td>
									<td className='px-5 py-3.5'>
										<p className='font-medium text-ink'>{order.user?.name ?? "Khách vãng lai"}</p>
										<p className='truncate text-xs text-muted'>{order.user?.email}</p>
									</td>
									<td className='px-5 py-3.5'>
										{order.payment ? (
											<>
												<p className='text-ink/80'>{PAYMENT_METHOD_LABEL[order.payment.paymentMethod]}</p>
												<PaymentStatusBadge status={order.payment.paymentStatus} />
											</>
										) : (
											"—"
										)}
									</td>
									<td className='px-5 py-3.5 font-medium text-ink'>{formatCurrency(Number(order.totalAmount))}</td>
									<td className='px-5 py-3.5'>
										<OrderStatusBadge status={order.orderStatus} />
									</td>
									<td className='px-5 py-3.5 text-ink/70'>{formatOrderDate(order.createdAt)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{selectedOrderId !== null && (
				<OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
			)}
		</div>
	);
};

export default AdminOrderPage;
