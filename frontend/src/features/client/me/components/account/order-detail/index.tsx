import Button from "../../../../../../components/button";
import { ChevronRightIcon, MapPinIcon } from "../../../../../../components/icons";
import { formatCurrency } from "../../../../../../utils/currency";
import { useCancelMyOrder, useMyOrderDetailQuery } from "../../../../order/hooks";
import { ORDER_STATUS_LABEL } from "../../../../../admin/order/utils";
import OrderStatusBadge from "../../../../../admin/order/components/order-status-badge";
import PaymentStatusBadge from "../../../../../admin/order/components/payment-status-badge";
import OrderTracking from "./order-tracking";
import { Link, useNavigate } from "react-router-dom";
import paths from "../../../../../../configs/constants/paths";
import { useCreatePaymentUrlMutation } from "../../../../payment/hooks";
import { formatDate } from "../../../../../../utils";
import OrderDetailSkeleton from "./skeleton";
import cartService from "../../../../cart/services";
import { CART_QUERY_KEY } from "../../../../cart/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import ChangePaymentMethodModal from "../../../../payment/components/change-payment-method-modal";
import { ONLINE_GATEWAY_METHODS, PAYMENT_METHOD, PAYMENT_STATUS, type PaymentMethod } from "../../../../../../shared/constants/payment";
import { ORDER_STATUS, type OrderStatus } from "../../../../../../shared/constants/order";
import { PAYMENT_METHOD_LABEL } from "../../../../../admin/payment/utils";

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
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: order, isLoading } = useMyOrderDetailQuery(orderId);
	const cancelOrder = useCancelMyOrder();
	const createPaymentUrl = useCreatePaymentUrlMutation();
	const [isReordering, setIsReordering] = useState(false);
	const [showChangeMethodModal, setShowChangeMethodModal] = useState(false);

	const handlePayNow = () => {
		createPaymentUrl.mutate(orderId, {
			onSuccess: (res) => {
				window.location.href = res.data.data.url;
			},
		});
	};

	/**
	 * "Đặt lại" cho đơn đã hủy — đơn hủy KHÔNG thể thanh toán lại (BE chặn hẳn ở
	 * payment.service.ts -> getGatewayPaymentContext), nên lối duy nhất để mua lại là tạo đơn MỚI.
	 * Thay vì cần 1 endpoint riêng ở BE, tự thêm lại từng sản phẩm vào giỏ hàng hiện tại (product
	 * đã bị xoá hoặc hết hàng thì bỏ qua, không chặn cả thao tác) rồi điều hướng sang trang giỏ
	 * hàng để khách tự xác nhận lại trước khi đặt.
	 */
	const handleReorder = async () => {
		if (!order) return;
		setIsReordering(true);
		let addedCount = 0;
		let skippedCount = 0;

		for (const item of order.items) {
			if (!item.productSkuId) {
				skippedCount++;
				continue;
			}
			try {
				await cartService.addItem({ productSkuId: item.productSkuId, quantity: item.quantity });
				addedCount++;
			} catch {
				skippedCount++;
			}
		}

		queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
		setIsReordering(false);

		if (addedCount === 0) {
			toast.error("Không thể đặt lại đơn hàng này — các sản phẩm không còn khả dụng.");
			return;
		}
		toast.success(skippedCount > 0 ? `Đã thêm ${addedCount} sản phẩm vào giỏ hàng (${skippedCount} sản phẩm không còn khả dụng).` : `Đã thêm ${addedCount} sản phẩm vào giỏ hàng.`);
		navigate(paths.client.cart);
	};

	/**
	 * Cho phép mở modal đổi phương thức thanh toán — mirror ĐÚNG điều kiện BE tự kiểm tra ở
	 * payment.service.ts -> changeOwnPaymentMethod() (đơn còn "pending" và (đang COD, hoặc đang
	 * online nhưng chưa thanh toán "completed")). FE chỉ dùng để ẨN nút cho gọn UX, BE vẫn là nơi
	 * validate thật sự.
	 */
	const canChangePaymentMethod = !!order && order.orderStatus === "pending" && !!order.payment && (order.payment.paymentMethod === PAYMENT_METHOD.cod || order.payment.paymentStatus !== "completed");

	return (
		<div>
			<button type='button' onClick={onBack} className='mb-4 flex items-center gap-1 text-sm font-semibold text-primary-dark hover:underline'>
				<ChevronRightIcon className='h-4 w-4 rotate-180' />
				Quay lại danh sách đơn hàng
			</button>

			{isLoading || !order ? (
				<OrderDetailSkeleton />
			) : (
				<div className='space-y-5'>
					{/* Header */}
					<div className='flex flex-wrap items-start justify-between gap-2 rounded-2xl border border-border bg-surface p-5'>
						<div>
							<p className='font-bold text-ink'>{order.orderNumber}</p>
							<p className='mt-1 text-xs text-muted'>Đặt lúc {formatDate(order.createdAt)}</p>
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
								{order.shippingAddress.addressLine}, {order.shippingAddress.wardName}, {order.shippingAddress.districtName}, {order.shippingAddress.provinceName}
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
									<Link to={`${paths.client.productDetail(`${item.productSku?.product?.slug}`)}`} key={item.id} className='flex items-center justify-between py-3 text-sm'>
										<div className='w-full flex flex-wrap items-center justify-between gap-2 sm:gap-4'>
											<div className='flex items-center justify-start gap-2'>
												<img
													src={item?.productSku?.images[0]?.imageUrl ?? ""}
													alt={item?.productSku?.images[0]?.altText ?? ""}
													width={50}
													height={50}
													className='shrink-0 rounded border border-border'
												/>
												<div className='min-w-0'>
													<p className='line-clamp-1 font-medium text-ink'>{item.productSku?.product?.name ?? "Sản phẩm đã bị xóa"}</p>
													<p className='text-xs text-muted'>
														SL: {item.quantity}
														{variation ? ` · ${variation}` : ""}
													</p>
												</div>
											</div>
											<p className='shrink-0 font-semibold text-ink ml-auto'>{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</p>
										</div>
									</Link>
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
							<span className='text-primary-dark'>{formatCurrency(Number(order.totalAmount))}</span>
						</div>
					</div>

					{/* Thanh toán */}
					{order.payment && (
						<div className='space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm'>
							<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>Thanh toán</p>
							<div className='flex items-center justify-between'>
								<span className='text-ink/80'>{PAYMENT_METHOD_LABEL[order.payment.paymentMethod as PaymentMethod]}</span>
								<PaymentStatusBadge status={order.payment.paymentStatus} />
							</div>

							{/* SỬA — thêm điều kiện `order.orderStatus !== "cancelled"` phía trước (trước đây chỉ check
		    					paymentStatus, không check orderStatus, nên đơn đã hủy vẫn hiện nút "Thanh toán ngay" dù
		    					BE giờ đã chặn hẳn ở payment.service.ts -> getGatewayPaymentContext). */}
							{order.orderStatus !== ORDER_STATUS.cancelled &&
								ONLINE_GATEWAY_METHODS.includes(order.payment.paymentMethod) &&
								(order.payment.paymentStatus === PAYMENT_STATUS.pending || order.payment.paymentStatus === PAYMENT_STATUS.failed) && (
									<Button variant='outline' size='sm' className='w-full cursor-pointer!' disabled={createPaymentUrl.isPending} onClick={handlePayNow}>
										{createPaymentUrl.isPending ? "Đang chuyển hướng..." : "Thanh toán ngay"}
									</Button>
								)}

							{/* MỚI — Đổi phương thức thanh toán */}
							{canChangePaymentMethod && (
								<Button variant='outline' size='sm' className='w-full cursor-pointer!' onClick={() => setShowChangeMethodModal(true)}>
									Đổi phương thức thanh toán
								</Button>
							)}
						</div>
					)}

					{order.orderStatus === ORDER_STATUS.pending && (
						<div className='flex justify-end'>
							<Button variant='outline' size='sm' disabled={cancelOrder.isPending} onClick={() => cancelOrder.mutate(order.id)}>
								{cancelOrder.isPending ? "Đang hủy..." : `Hủy đơn (${ORDER_STATUS_LABEL[order.orderStatus as OrderStatus]})`}
							</Button>
						</div>
					)}

					{/* MỚI — toàn bộ block này */}
					{/* Đơn đã hủy không thể thanh toán lại (xem block "Thanh toán" phía trên) -> lối duy nhất để
   						mua lại cùng sản phẩm là tạo đơn MỚI, xem handleReorder(). */}
					{order.orderStatus === ORDER_STATUS.cancelled && (
						<div className='flex justify-end'>
							<Button variant='outline' size='sm' disabled={isReordering} onClick={handleReorder}>
								{isReordering ? "Đang thêm vào giỏ hàng..." : "Đặt lại"}
							</Button>
						</div>
					)}
				</div>
			)}

			{showChangeMethodModal && order?.payment && <ChangePaymentMethodModal orderId={order.id} currentMethod={order.payment.paymentMethod} onClose={() => setShowChangeMethodModal(false)} />}
		</div>
	);
};

export default OrderDetail;
