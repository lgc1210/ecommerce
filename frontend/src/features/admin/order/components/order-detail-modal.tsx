import { useState } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";
import { MailIcon, MapPinIcon, PhoneIcon, UserIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { useOrderDetailQuery, useUpdateOrderStatus } from "../hooks";
import type { AdminOrderDetail, OrderStatus } from "../types";
import {
	formatOrderDate,
	getNextOrderStatusOptions,
	isTerminalOrderStatus,
	ORDER_STATUS_LABEL,
	PAYMENT_METHOD_LABEL,
} from "../utils";
import OrderStatusBadge from "./order-status-badge";
import PaymentStatusBadge from "./payment-status-badge";

interface OrderDetailModalProps {
	orderId: number;
	onClose: () => void;
}

/** "Đen / M" — trả về null nếu không có snapshot biến thể (sản phẩm không có variation). */
const formatVariationSnapshot = (snapshot: Record<string, string> | null): string | null => {
	if (!snapshot || Object.keys(snapshot).length === 0) return null;
	return Object.values(snapshot).join(" / ");
};

interface OrderDetailContentProps {
	order: AdminOrderDetail;
}

/**
 * Tách riêng phần nội dung để state `pendingStatus` khởi tạo lại (qua `key` ở
 * component cha, xem OrderDetailModal bên dưới) mỗi khi `order.orderStatus`
 * đổi trên server — vd. sau khi lưu trạng thái thành công — thay vì phải đồng
 * bộ bằng useEffect (setState trong effect dễ gây cascading render).
 */
const OrderDetailContent = ({ order }: OrderDetailContentProps) => {
	const updateOrderStatus = useUpdateOrderStatus();
	const [pendingStatus, setPendingStatus] = useState<OrderStatus>(order.orderStatus);

	const hasStatusChanged = pendingStatus !== order.orderStatus;
	const statusOptions = getNextOrderStatusOptions(order.orderStatus);

	return (
		<div className='max-h-[75vh] space-y-5 overflow-y-auto pr-1'>
			{/* Header */}
			<div className='flex flex-wrap items-start justify-between gap-2'>
				<div>
					<p className='font-semibold text-ink'>{order.orderNumber}</p>
					<p className='mt-1 text-xs text-muted'>Đặt lúc {formatOrderDate(order.createdAt)}</p>
				</div>
				<OrderStatusBadge status={order.orderStatus} />
			</div>

			{/* Khách hàng + địa chỉ giao hàng */}
			<div className='grid gap-3 sm:grid-cols-2'>
				<div className='space-y-2 rounded-xl bg-cream-soft p-4 text-sm'>
					<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Khách hàng</p>
					<div className='flex items-center gap-2 text-ink'>
						<UserIcon className='h-4 w-4 shrink-0 text-muted' />
						<span className='font-medium'>{order.user?.name ?? "Khách vãng lai"}</span>
					</div>
					{order.user && (
						<div className='flex items-center gap-2 text-ink/80'>
							<MailIcon className='h-4 w-4 shrink-0 text-muted' />
							<a href={`mailto:${order.user.email}`} className='hover:underline'>
								{order.user.email}
							</a>
						</div>
					)}
					{order.user?.phone && (
						<div className='flex items-center gap-2 text-ink/80'>
							<PhoneIcon className='h-4 w-4 shrink-0 text-muted' />
							<span>{order.user.phone}</span>
						</div>
					)}
				</div>

				<div className='space-y-2 rounded-xl bg-cream-soft p-4 text-sm'>
					<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Địa chỉ giao hàng</p>
					{order.shippingAddress ? (
						<>
							<div className='flex items-center gap-2 text-ink'>
								<MapPinIcon className='h-4 w-4 shrink-0 text-muted' />
								<span className='font-medium'>{order.shippingAddress.recipientName}</span>
								<span className='text-ink/70'>· {order.shippingAddress.phoneNumber}</span>
							</div>
							<p className='pl-6 text-ink/80'>
								{order.shippingAddress.addressLine}, {order.shippingAddress.wardName},{" "}
								{order.shippingAddress.districtName}, {order.shippingAddress.provinceName}
							</p>
						</>
					) : (
						<p className='text-ink/60'>Không có thông tin địa chỉ.</p>
					)}
				</div>
			</div>

			{/* Danh sách sản phẩm */}
			<div>
				<p className='mb-1.5 text-sm font-medium text-ink'>Sản phẩm ({order.items.length})</p>
				<div className='overflow-x-auto rounded-xl border border-border'>
					<table className='w-full min-w-140 text-left text-sm'>
						<thead>
							<tr className='border-b border-border bg-cream-soft/60 text-xs font-semibold uppercase tracking-wider text-muted'>
								<th className='px-4 py-2.5'>Sản phẩm</th>
								<th className='px-4 py-2.5'>SL</th>
								<th className='px-4 py-2.5'>Đơn giá</th>
								<th className='px-4 py-2.5 text-right'>Thành tiền</th>
							</tr>
						</thead>
						<tbody>
							{order.items.map((item) => {
								const variation = formatVariationSnapshot(item.variationSnapshot);
								return (
									<tr key={item.id} className='border-b border-border last:border-0'>
										<td className='px-4 py-2.5'>
											<p className='font-medium text-ink'>{item.productSku?.product?.name ?? "Sản phẩm đã bị xóa"}</p>
											<p className='text-xs text-muted'>
												{item.productSku?.sku}
												{variation ? ` · ${variation}` : ""}
											</p>
										</td>
										<td className='px-4 py-2.5 text-ink/80'>{item.quantity}</td>
										<td className='px-4 py-2.5 text-ink/80'>{formatCurrency(Number(item.priceAtPurchase))}</td>
										<td className='px-4 py-2.5 text-right font-medium text-ink'>
											{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Tổng tiền */}
			<div className='space-y-1.5 rounded-xl bg-cream-soft p-4 text-sm'>
				<div className='flex justify-between text-ink/80'>
					<span>Tạm tính</span>
					<span>{formatCurrency(Number(order.subtotalAmount))}</span>
				</div>
				<div className='flex justify-between text-ink/80'>
					<span>Giảm giá{order.coupon ? ` (mã ${order.coupon.code})` : ""}</span>
					<span>-{formatCurrency(Number(order.discountAmount))}</span>
				</div>
				<div className='flex justify-between text-ink/80'>
					<span>Phí vận chuyển</span>
					<span>{formatCurrency(Number(order.shippingFee))}</span>
				</div>
				<div className='flex justify-between border-t border-border pt-1.5 font-semibold text-ink'>
					<span>Tổng cộng</span>
					<span>{formatCurrency(Number(order.totalAmount))}</span>
				</div>
			</div>

			{/* Thanh toán */}
			{order.payment && (
				<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
					<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Thanh toán</p>
					<div className='flex items-center justify-between'>
						<span className='text-ink/80'>{PAYMENT_METHOD_LABEL[order.payment.paymentMethod]}</span>
						<PaymentStatusBadge status={order.payment.paymentStatus} />
					</div>
					{order.payment.transactionId && (
						<p className='text-xs text-muted'>Mã giao dịch: {order.payment.transactionId}</p>
					)}
					{order.payment.paidAt && (
						<p className='text-xs text-muted'>Thanh toán lúc {formatOrderDate(order.payment.paidAt)}</p>
					)}
				</div>
			)}

			{/* Đổi trạng thái xử lý */}
			<div className='flex items-end gap-3 border-t border-border pt-4'>
				<FormSelect
					label='Trạng thái xử lý'
					wrapperClassName='flex-1'
					value={pendingStatus}
					disabled={isTerminalOrderStatus(order.orderStatus)}
					onChange={(e) => setPendingStatus(e.target.value as OrderStatus)}
					options={statusOptions.map((status) => ({ value: status, label: ORDER_STATUS_LABEL[status] }))}
				/>
				<Button
					size='sm'
					type='button'
					disabled={!hasStatusChanged || updateOrderStatus.isPending}
					onClick={() => updateOrderStatus.mutate({ id: order.id, status: pendingStatus })}>
					{updateOrderStatus.isPending ? "Đang lưu..." : "Lưu trạng thái"}
				</Button>
			</div>
		</div>
	);
};

/**
 * Modal xem chi tiết 1 đơn hàng + đổi trạng thái xử lý. Không nhận sẵn data
 * từ bảng danh sách vì orderListInclude (backend) không có items/địa chỉ
 * giao hàng/coupon — modal tự gọi GET /orders/admin/:id khi mở.
 */
const OrderDetailModal = ({ orderId, onClose }: OrderDetailModalProps) => {
	const { data: order, isLoading } = useOrderDetailQuery(orderId);

	return (
		<ModalShell title='Chi tiết đơn hàng' onClose={onClose} maxWidthClassName='max-w-2xl'>
			{isLoading || !order ? (
				<p className='py-8 text-center text-sm text-muted'>Đang tải...</p>
			) : (
				<OrderDetailContent key={`${order.id}-${order.orderStatus}`} order={order} />
			)}
		</ModalShell>
	);
};

export default OrderDetailModal;
