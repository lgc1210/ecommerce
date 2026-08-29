import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/breadcrumb";
import Button from "../../../components/button";
import paths from "../../../configs/constants/paths";
import { CartIcon } from "../../../components/icons";
import { useCreatePaymentUrlMutation } from "../../../features/client/payment/hooks";
import { useCart } from "../../../features/client/cart/hooks";
import { usePreviewShippingFeeQuery, useCreateOrderMutation } from "../../../features/client/order/hooks";
import type { PaymentMethod } from "../../../features/client/order/types";
import type { ValidateCouponResult } from "../../../features/client/coupon/types";
import CheckoutAddressSection from "../../../features/client/payment/components/checkout-address-section";
import CheckoutProductSection from "../../../features/client/payment/components/checkout-product-section";
import CheckoutDeliveryMethodSection from "../../../features/client/payment/components/checkout-delivery-method-section";
import CheckoutPaymentMethodSection from "../../../features/client/payment/components/checkout-payment-method-section";
import CheckoutDiscountSection from "../../../features/client/payment/components/checkout-discount-section";
import CheckoutSummarySection from "../../../features/client/payment/components/checkout-summary-section";
import PaymentPageSkeleton from "./skeleton";
import { ONLINE_GATEWAY_METHODS, PAYMENT_METHOD } from "../../../shared/constants/payment";

const PaymentPage = () => {
	const navigate = useNavigate();
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.cod);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
	const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(null);

	// Giỏ hàng thật (cùng nguồn dữ liệu với trang /cart).
	const { items, subtotal, isLoading: isCartLoading } = useCart();

	// Phí ship THẬT (GHN), tính lại mỗi khi đổi địa chỉ nhận hàng — xem POST /orders/shipping-fee.
	const shippingFeeQuery = usePreviewShippingFeeQuery(selectedAddressId);
	const shippingFee = shippingFeeQuery.data?.shippingFee ?? null;

	const createOrder = useCreateOrderMutation();
	const createPaymentUrl = useCreatePaymentUrlMutation();

	// Mã giảm giá được tính trước theo subtotal hiện tại tại thời điểm áp dụng; nếu giỏ hàng đổi
	// sau đó (số tiền giảm không còn khớp), backend vẫn tự tính lại chính xác lúc đặt hàng thật.
	const discount = appliedCoupon?.discountAmount ?? 0;
	const total = subtotal + (shippingFee ?? 0) - discount;

	const handlePlaceOrder = () => {
		if (!selectedAddressId) {
			toast.error("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
			return;
		}
		if (items.some((item) => !item.inStock)) {
			toast.error("Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng kinh doanh, vui lòng quay lại giỏ hàng để xóa.");
			return;
		}
		if (shippingFeeQuery.isLoading || shippingFeeQuery.isError || shippingFee === null) {
			toast.error("Chưa tính được phí vận chuyển cho địa chỉ này, vui lòng thử lại hoặc đổi địa chỉ khác.");
			return;
		}
		const payload = {
			shippingAddressId: selectedAddressId,
			paymentMethod,
			couponCode: appliedCoupon?.code,
		};
		createOrder.mutate(payload, {
			onSuccess: (res) => {
				const order = res.data.data;
				// Phương thức thanh toán qua cổng online (VNPay/ZaloPay) -> lấy URL rồi redirect thẳng
				// trình duyệt sang trang gateway để khách hoàn tất thanh toán ngay (trang payment-result
				// sẽ được hiển thị sau khi gateway redirect ngược về). COD/các phương thức khác chưa hỗ
				// trợ thì không có bước redirect gateway, nhưng vẫn cần cho khách thấy kết quả đặt hàng
				// -> điều hướng thẳng tới trang payment-result kèm orderId, KHÔNG toast rồi về thẳng
				// trang "Đơn hàng của tôi" như trước (khiến khách không thấy xác nhận đơn/phương thức
				// thanh toán vừa chọn).
				if (ONLINE_GATEWAY_METHODS.includes(paymentMethod)) {
					createPaymentUrl.mutate(order.id, {
						onSuccess: (urlRes) => {
							window.location.href = urlRes.data.data.url;
						},
						onError: () => {
							// Tạo URL thất bại (vd lỗi cấu hình cổng) -> đơn vẫn đã tạo thành công, khách có
							// thể vào "Đơn hàng của tôi" để thử thanh toán lại sau (xem order-detail.tsx).
							navigate(paths.client.account, { state: { tab: "orders" } });
						},
					});
					return;
				}
				navigate(`${paths.client.paymentResult}?orderId=${order.id}`);
			},
		});
	};

	if (isCartLoading) {
		return <PaymentPageSkeleton />;
	}

	if (items.length === 0) {
		return (
			<div>
				<BreadCrumb title='Thanh toán' description='Xác nhận đơn hàng và hoàn tất thanh toán' />
				<div className='mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8'>
					<CartIcon className='mx-auto h-12 w-12 text-muted' />
					<h1 className='mt-4 text-2xl font-bold text-ink'>Giỏ hàng của bạn đang trống</h1>
					<p className='mt-2 text-muted'>Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
					<Link to={paths.client.shop}>
						<Button className='mt-6'>Tiếp tục mua sắm</Button>
					</Link>
				</div>
			</div>
		);
	}

	const handlePaymentMethodChange = (value: string) => {
		if (value === PAYMENT_METHOD.momo || value === PAYMENT_METHOD.stripe || value === PAYMENT_METHOD.paypal) {
			toast.info("Tính năng đang được phát triển, vui lồng chọn phương thức thanh toán khác.");
			return;
		}
		setPaymentMethod(value as PaymentMethod);
	};

	return (
		<>
			<BreadCrumb title='Thanh toán' description='Xác nhận đơn hàng và hoàn tất thanh toán' />
			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<div className='grid gap-8 lg:grid-cols-12'>
					{/* LEFT */}
					<div className='space-y-6 lg:col-span-8'>
						<CheckoutAddressSection selectedAddressId={selectedAddressId} onSelectAddress={(address) => setSelectedAddressId(address.id)} />
						<CheckoutProductSection items={items} />
						<CheckoutDeliveryMethodSection shippingFee={shippingFee} isLoading={selectedAddressId !== null && shippingFeeQuery.isLoading} isError={shippingFeeQuery.isError} />
						<CheckoutPaymentMethodSection value={paymentMethod} onChange={handlePaymentMethodChange} />
					</div>
					{/* RIGHT */}
					<div className='lg:col-span-4'>
						<div className='sticky top-24 space-y-6'>
							<CheckoutDiscountSection orderSubtotal={subtotal} appliedCoupon={appliedCoupon} onApply={setAppliedCoupon} onRemove={() => setAppliedCoupon(null)} />
							<CheckoutSummarySection
								subtotal={subtotal}
								shippingFee={shippingFee ?? 0}
								discount={discount}
								total={total}
								onPlaceOrder={handlePlaceOrder}
								isPlacingOrder={createOrder.isPending || createPaymentUrl.isPending}
								disabled={!selectedAddressId}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentPage;
