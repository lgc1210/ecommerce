import { useState } from "react";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Pagination from "../../../components/pagination";
import AdminTitle from "../../../components/admin-title";
import { CloseIcon, SearchIcon } from "../../../components/icons";
import { Button } from "../../../components/button";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils";
import { useShipmentsAdminQuery } from "../../../features/admin/transport/hooks";
import type { AdminShipment } from "../../../features/admin/transport/types";
import { GHN_STATUS_LABEL } from "../../../features/admin/transport/utils";
import GhnStatusBadge from "../../../features/admin/transport/components/ghn-status-badge";
import ShipmentDetailModal from "../../../features/admin/transport/components/shipment-detail-modal";
import OrderStatusBadge from "../../../features/admin/order/components/order-status-badge";
import { PAYMENT_METHOD_LABEL } from "../../../features/admin/payment/utils";
import { SkeletonTableRows } from "../../../shared/components/skeleton";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination).
const PAGE_SIZE = 10;

/**
 * Trang quản trị Vận chuyển: các đơn hàng đã có vận đơn Giao Hàng Nhanh. Route "/admin/transport" được bảo vệ
 * bởi requirePermissionLoader(permissions.transport.manage) (xem configs/routes/index.ts), khớp với backend
 * (mọi route /transport yêu cầu permission "transport:manage").
 *
 * Phân trang + filter lưu thẳng lên URL query string, cùng pattern với trang Order/Payment.
 */
const AdminTransportPage = () => {
	const {
		searchParams,
		page,
		limit,
		search,
		searchInput,
		setSearchInput,
		setFilter,
		clearFilters,
		hasActiveFilters,
	} = useListQueryParams({
		defaultLimit: PAGE_SIZE,
	});

	const ghnStatus = searchParams.get("ghnStatus") ?? undefined;
	const dateFrom = searchParams.get("dateFrom") ?? "";
	const dateTo = searchParams.get("dateTo") ?? "";

	const { data, isLoading, isFetching } = useShipmentsAdminQuery({
		page,
		limit,
		search,
		ghnStatus,
		dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
		dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
	});

	const [selectedShipment, setSelectedShipment] =
		useState<AdminShipment | null>(null);

	const shipments = data?.data ?? [];
	const pagination = data?.pagination;

	// Lấy bản mới nhất của đơn đang xem từ danh sách (sau khi đồng bộ/giao lại/hoàn hàng, danh sách được refetch);
	// nếu đơn không còn nằm trong trang hiện tại (vd. đang lọc theo trạng thái và trạng thái vừa đổi) thì giữ bản cũ.
	const activeShipment =
		shipments.find((shipment) => shipment.id === selectedShipment?.id) ??
		selectedShipment;

	return (
		<div className='space-y-6'>
			<AdminTitle
				title='Vận chuyển'
				description='Theo dõi và xử lý các vận đơn Giao Hàng Nhanh của đơn hàng.'
			/>

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo mã đơn, mã vận đơn, tên/SĐT người nhận...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={ghnStatus ?? ""}
					onChange={(e) => setFilter("ghnStatus", e.target.value || undefined)}
					placeholder='Tất cả trạng thái GHN'
					options={Object.entries(GHN_STATUS_LABEL).map(([value, label]) => ({
						value,
						label,
					}))}
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
				{hasActiveFilters(["ghnStatus", "dateFrom", "dateTo"]) && (
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
				<table className='w-full min-w-250 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Mã đơn</th>
							<th className='px-5 py-3.5'>Mã vận đơn</th>
							<th className='px-5 py-3.5'>Người nhận</th>
							<th className='px-5 py-3.5'>Thanh toán</th>
							<th className='px-5 py-3.5'>Trạng thái GHN</th>
							<th className='px-5 py-3.5'>Trạng thái đơn</th>
							<th className='px-5 py-3.5'>Ngày tạo</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<SkeletonTableRows rows={PAGE_SIZE} columns={7} />
						) : shipments.length === 0 ? (
							<tr>
								<td colSpan={7} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy vận đơn nào.
								</td>
							</tr>
						) : (
							shipments.map((shipment) => (
								<tr
									key={shipment.id}
									onClick={() => setSelectedShipment(shipment)}
									className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5 font-semibold text-ink'>
										{shipment.orderNumber}
									</td>
									<td className='px-5 py-3.5 text-ink/80'>
										{shipment.ghnOrderCode}
									</td>
									<td className='px-5 py-3.5'>
										<p className='font-medium text-ink'>
											{shipment.shippingAddress?.recipientName ?? "—"}
										</p>
										<p className='truncate text-xs text-muted'>
											{shipment.shippingAddress?.phoneNumber}
										</p>
									</td>
									<td className='px-5 py-3.5'>
										<p className='text-ink/80'>
											{shipment.payment
												? PAYMENT_METHOD_LABEL[shipment.payment.paymentMethod]
												: "—"}
										</p>
										<p className='text-xs font-medium text-ink'>
											{formatCurrency(Number(shipment.totalAmount))}
										</p>
									</td>
									<td className='px-5 py-3.5'>
										{shipment.ghnStatus ? (
											<GhnStatusBadge status={shipment.ghnStatus} />
										) : (
											"—"
										)}
									</td>
									<td className='px-5 py-3.5'>
										<OrderStatusBadge status={shipment.orderStatus} />
									</td>
									<td className='px-5 py-3.5 text-ink/70'>
										{shipment.createdAt ? formatDate(shipment.createdAt) : "—"}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && (
				<p className='text-right text-xs text-muted'>Đang cập nhật...</p>
			)}

			<Pagination
				total={pagination?.total ?? 0}
				defaultLimit={PAGE_SIZE}
				isLoading={isFetching}
			/>

			{activeShipment && (
				<ShipmentDetailModal
					shipment={activeShipment}
					onClose={() => setSelectedShipment(null)}
				/>
			)}
		</div>
	);
};

export default AdminTransportPage;
