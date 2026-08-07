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
import { formatDate } from "../../../utils";
import { usePaymentsAdminQuery } from "../../../features/admin/payment/hooks";
import type { PaymentMethod, PaymentStatus } from "../../../features/admin/payment/types";
import { PAYMENT_METHOD_FILTER_OPTIONS } from "../../../features/admin/payment/constants";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "../../../features/admin/payment/utils";
import PaymentStatusBadge from "../../../features/admin/payment/components/payment-status-badge";
import PaymentDetailModal from "../../../features/admin/payment/components/payment-detail-modal";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend.
const PAGE_SIZE = 10;

/**
 * Trang quản trị Payment. Route "/admin/payment" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.payment.read) (xem configs/routes/index.ts) — khớp với
 * backend: GET /payments/admin (list/detail) yêu cầu permission "payment:read", còn PATCH đổi
 * trạng thái ở /payments/admin/:id/status yêu cầu "payment:manage" (nút "Lưu thay đổi" trong
 * modal sẽ trả lỗi 403 qua toast nếu tài khoản chỉ có "payment:read").
 *
 * Phân trang + filter (search/status/method/khoảng ngày) lưu thẳng lên URL query string, cùng
 * pattern với trang Order/Contact: reload/back-forward vẫn giữ đúng view, copy link chia sẻ được.
 */
const AdminPaymentPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } = useListQueryParams({
		defaultLimit: PAGE_SIZE,
	});

	const status = parseEnumParam<PaymentStatus>(searchParams, "status");
	const method = parseEnumParam<PaymentMethod>(searchParams, "method");
	// dateFrom/dateTo giữ nguyên dạng chuỗi thô (không cần parser riêng) — chỉ convert sang ISO
	// ngay trước khi gọi API bên dưới, cùng pattern với trang Order.
	const dateFrom = searchParams.get("dateFrom") ?? "";
	const dateTo = searchParams.get("dateTo") ?? "";

	const { data, isLoading, isFetching } = usePaymentsAdminQuery({
		page,
		limit,
		search,
		status,
		method,
		dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
		dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
	});

	const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

	const payments = data?.data ?? [];
	const pagination = data?.pagination;
	// Tìm lại object mới nhất từ danh sách (đã invalidate sau mutation) thay vì giữ snapshot cũ,
	// để modal luôn hiển thị đúng trạng thái mới nhất — xem docstring usePaymentsAdminQuery.
	const selectedPayment = payments.find((p) => p.id === selectedPaymentId) ?? null;

	return (
		<div className='space-y-6'>
			<AdminTitle title='Thanh toán' description='Theo dõi và xử lý các giao dịch thanh toán của đơn hàng.' />

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
					options={Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
				/>
				<FormSelect
					value={method ?? ""}
					onChange={(e) => setFilter("method", e.target.value || undefined)}
					placeholder='Tất cả phương thức'
					options={PAYMENT_METHOD_FILTER_OPTIONS.map((value) => ({ value, label: PAYMENT_METHOD_LABEL[value] }))}
				/>
				<FormControl type='date' value={dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value || undefined)} wrapperClassName='w-40' />
				<FormControl type='date' value={dateTo} onChange={(e) => setFilter("dateTo", e.target.value || undefined)} wrapperClassName='w-40' />
				{hasActiveFilters(["status", "method", "dateFrom", "dateTo"]) && (
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
							<th className='px-5 py-3.5'>Phương thức</th>
							<th className='px-5 py-3.5'>Số tiền</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5'>Ngày tạo</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : payments.length === 0 ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy giao dịch thanh toán nào.
								</td>
							</tr>
						) : (
							payments.map((payment) => (
								<tr key={payment.id} onClick={() => setSelectedPaymentId(payment.id)} className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5 font-semibold text-ink'>{payment.order.orderNumber}</td>
									<td className='px-5 py-3.5'>
										<p className='font-medium text-ink'>{payment.order.user?.name ?? "Khách vãng lai"}</p>
										<p className='truncate text-xs text-muted'>{payment.order.user?.email}</p>
									</td>
									<td className='px-5 py-3.5 text-ink/80'>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</td>
									<td className='px-5 py-3.5 font-medium text-ink'>{formatCurrency(Number(payment.amount))}</td>
									<td className='px-5 py-3.5'>
										<PaymentStatusBadge status={payment.paymentStatus} />
									</td>
									<td className='px-5 py-3.5 text-ink/70'>{payment.createdAt ? formatDate(payment.createdAt) : "—"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{selectedPayment && <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPaymentId(null)} />}
		</div>
	);
};

export default AdminPaymentPage;
