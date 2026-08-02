import Button from "../../../../components/button";
import { ChevronRightIcon, MapPinIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { useCancelMyOrder, useMyOrderDetailQuery } from "../hooks";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, formatOrderDate } from "../../../admin/order/utils";
import OrderStatusBadge from "../../../admin/order/components/order-status-badge";
import PaymentStatusBadge from "../../../admin/order/components/payment-status-badge";
import OrderTracking from "./order-tracking";

/** "Đen / M" — trả về null nếu sản phẩm không có snapshot biến thể. */
const formatVariationSnapshot = (snapshot: Record<string, string> | null): string | null => {
	if (!snapshot || Object.keys(snapshot).length === 0) return null;
	return Object.values(snapshot).join(" / ");
};

interface OrderDetailProps {
	orderId: number;
	onBack: () => void;
}

/**
 * Chi tiết 1 đơn hàng của chính user hiện tại + tracking, hiển thị lồng bên
 * trong tab "Đơn hàng" ở trang tài khoản (không dùng modal/route riêng để giữ
 * điều hướng đơn giản: 1 tab, chuyển qua lại giữa danh sách <-> chi tiết bằng
 * state cục bộ ở component cha OrdersTab).
 */
const OrderDetail = ({ orderId, onBack }: OrderDetailProps) => {
	const { data: order, isLoading } = useMyOrderDetailQuery(orderId);
	const cancelOrder = useCancelMyOrder();

	return (
		<div>
			<button
				type='button'
				onClick={onBack}
				className='mb-4 flex items-center gap-1 text-sm font-semibold text-primary-dark hover:underline'>
				<ChevronRightIcon className='h-4 w-4 rotate-180' />
				Quay lại danh sách đơn hàng
			</button>

			{isLoading || !order ? (
				<p className='py-8 text-center text-sm text-muted'>Đang tải...</p>
			) : (
				<div className='space-y-5'>
					{/* Header */}
					<div className='flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-border bg-surface p-5'>
						<div>
							<p className='font-bold text-ink'>{order.orderNumber}</p>
							<p className='mt-1 text-xs text-muted'>Đặt lúc {formatOrderDate(order.createdAt)}</p>
						</div>
						<OrderStatusBadge status={order.orderStatus} />
					</div>

					{/* Tracking */}
					<div className='rounded-2xl border border-border bg-surface p-5'>
						<p className='mb-5 text-sm font-semibold text-ink'>Theo dõi đơn hàng</p>
						<OrderTracking status={order.orderStatus} />
					</div>

					{/* Địa chỉ giao hàng */}
					{order.shippingAddress && (
						<div className='space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm'>
							<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Địa chỉ giao hàng</p>
							<div className='flex items-center gap-2 text-ink'>
								<MapPinIcon className='h-4 w-4 shrink-0 text-muted' />
								<span className='font-medium'>{order.shippingAddress.recipientName}</span>
								<span className='text-ink/70'>· {order.shippingAddress.phoneNumber}</span>
							</div>
							<p className='pl-6 text-ink/80'>
								{order.shippingAddress.addressLine}, {order.shippingAddress.wardName},{" "}
								{order.shippingAddress.districtName}, {order.shippingAddress.provinceName}
							</p>
						</div>
					)}

					{/* Sản phẩm */}
					<div className='rounded-2xl border border-border bg-surface p-5'>
						<p className='mb-3 text-sm font-semibold text-ink'>Sản phẩm ({order.items.length})</p>
						<div className='divide-y divide-border'>
							{order.items.map((item) => {
								const variation = formatVariationSnapshot(item.variationSnapshot);
								return (
									<div key={item.id} className='flex items-center justify-between gap-4 py-3 text-sm'>
										<div className='min-w-0'>
											<p className='truncate font-medium text-ink'>
												{item.productSku?.product?.name ?? "Sản phẩm đã bị xóa"}
											</p>
											<p className='text-xs text-muted'>
												SL: {item.quantity}
												{variation ? ` · ${variation}` : ""}
											</p>
										</div>
										<p className='shrink-0 font-semibold text-ink'>
											{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					{/* Tổng tiền */}
					<div className='space-y-1.5 rounded-2xl border border-border bg-surface p-5 text-sm'>
						<div className='flex justify-between text-muted'>
							<span>Tạm tính</span>
							<span className='text-ink'>{formatCurrency(Number(order.subtotalAmount))}</span>
						</div>
						{Number(order.discountAmount) > 0 && (
							<div className='flex justify-between text-primary-dark'>
								<span>Giảm giá{order.coupon ? ` (mã ${order.coupon.code})` : ""}</span>
								<span>-{formatCurrency(Number(order.discountAmount))}</span>
							</div>
						)}
						<div className='flex justify-between text-muted'>
							<span>Phí vận chuyển</span>
							<span className='text-ink'>{formatCurrency(Number(order.shippingFee))}</span>
						</div>
						<div className='flex justify-between border-t border-border pt-2 text-base font-bold text-ink'>
							<span>Tổng cộng</span>
							<span>{formatCurrency(Number(order.totalAmount))}</span>
						</div>
					</div>

					{/* Thanh toán */}
					{order.payment && (
						<div className='space-y-1.5 rounded-2xl border border-border bg-surface p-5 text-sm'>
							<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Thanh toán</p>
							<div className='flex items-center justify-between'>
								<span className='text-ink/80'>{PAYMENT_METHOD_LABEL[order.payment.paymentMethod]}</span>
								<PaymentStatusBadge status={order.payment.paymentStatus} />
							</div>
						</div>
					)}

					{order.orderStatus === "pending" && (
						<div className='flex justify-end'>
							<Button
								variant='outline'
								size='sm'
								disabled={cancelOrder.isPending}
								onClick={() => cancelOrder.mutate(order.id)}>
								{cancelOrder.isPending ? "Đang hủy..." : `Hủy đơn (${ORDER_STATUS_LABEL[order.orderStatus]})`}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default OrderDetail;
