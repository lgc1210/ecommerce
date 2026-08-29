import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/breadcrumb";
import Button from "../../../components/button";
import paths from "../../../configs/constants/paths";
import { CartIcon } from "../../../components/icons";
import { useCreatePaymentUrlMutation } from "../../../features/client/payment/hooks";
import { usePreviewBuyNowShippingFeeQuery, useBuyNowMutation } from "../../../features/client/order/hooks";
import type { BuyNowSnapshot, PaymentMethod } from "../../../features/client/order/types";
import type { ValidateCouponResult } from "../../../features/client/coupon/types";
import type { CartLineView } from "../../../features/client/cart/types";
import CheckoutAddressSection from "../../../features/client/payment/components/checkout-address-section";
import CheckoutProductSection from "../../../features/client/payment/components/checkout-product-section";
import CheckoutDeliveryMethodSection from "../../../features/client/payment/components/checkout-delivery-method-section";
import CheckoutPaymentMethodSection from "../../../features/client/payment/components/checkout-payment-method-section";
import CheckoutDiscountSection from "../../../features/client/payment/components/checkout-discount-section";
import CheckoutSummarySection from "../../../features/client/payment/components/checkout-summary-section";
import { ONLINE_GATEWAY_METHODS, PAYMENT_METHOD } from "../../../shared/constants/payment";

/**
 * Trang thanh toán cho luồng "Mua ngay" (bấm ở trang chi tiết sản phẩm) — đặt hàng thẳng ĐÚNG 1
 * SKU + số lượng đã chọn, KHÔNG đụng tới giỏ hàng thật của khách (khác hẳn PaymentPage, vốn luôn
 * đặt hàng từ toàn bộ giỏ hàng qua useCart()). Khớp với BE: OrderService.buyNow() dùng đúng chung
 * processCheckout() với checkout() giỏ hàng, chỉ khác nguồn `items` + không có cartCleanup.
 *
 * SKU + số lượng được truyền qua router `state` từ trang chi tiết sản phẩm (xem
 * ProductDetailPage -> handleBuyNow) thay vì query param, vì cần cả snapshot hiển thị (tên/ảnh/
 * giá/biến thể) để trang này tự render ngay mà không phải gọi lại API — giống hệt tinh thần
 * LocalCartItem ở giỏ hàng cục bộ. Giá/tồn kho hiển thị chỉ mang tính tham khảo, backend luôn tự
 * validate lại lúc đặt hàng thật (xem loadValidatedBuyNowItem ở order.service.ts).
 *
 * Vì router state không sống sót qua refresh/redirect đăng nhập, nút "Mua ngay" ở trang chi tiết
 * sản phẩm chỉ hiện khi khách ĐÃ đăng nhập — vào thẳng /buy-now mà không có state (refresh, dán
 * link, back/forward) sẽ rơi vào nhánh "trống" bên dưới, dẫn khách quay lại cửa hàng.
 */
const BuyNowPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const snapshot = (location.state as BuyNowSnapshot | null) ?? null;

	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.cod);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
	const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(null);

	// Sinh 1 LẦN DUY NHẤT cho cả vòng đời trang (kể cả khi khách đổi địa chỉ/phương thức thanh toán
	// nhiều lần trước khi bấm đặt hàng) — giữ nguyên giá trị này qua các lần bấm "Đặt hàng"/retry do
	// mất mạng, để backend nhận diện đúng đây là CÙNG 1 lượt mua, chặn double-submit. Rời trang rồi
	// quay lại (component unmount/mount lại) sẽ sinh key mới — đúng vì đó là 1 lượt mua mới.
	const [idempotencyKey] = useState(() => crypto.randomUUID());

	const shippingFeeQuery = usePreviewBuyNowShippingFeeQuery(snapshot?.productSkuId ?? null, snapshot?.quantity ?? 1, selectedAddressId);
	const shippingFee = shippingFeeQuery.data?.shippingFee ?? null;

	const buyNow = useBuyNowMutation();
	const createPaymentUrl = useCreatePaymentUrlMutation();

	if (!snapshot) {
		return (
			<div>
				<BreadCrumb title='Mua ngay' description='Xác nhận đơn hàng và hoàn tất thanh toán' />
				<div className='mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8'>
					<CartIcon className='mx-auto h-12 w-12 text-muted' />
					<h1 className='mt-4 text-2xl font-bold text-ink'>Không có sản phẩm nào để thanh toán</h1>
					<p className='mt-2 text-muted'>Vui lòng quay lại trang sản phẩm và bấm "Mua ngay" để tiếp tục.</p>
					<Link to={paths.client.shop}>
						<Button className='mt-6'>Tiếp tục mua sắm</Button>
					</Link>
				</div>
			</div>
		);
	}

	const item: CartLineView = {
		id: `buy-now-${snapshot.productSkuId}`,
		productSkuId: snapshot.productSkuId,
		productSlug: snapshot.productSlug,
		productName: snapshot.productName,
		image: snapshot.image,
		sku: snapshot.sku,
		variationDetails: snapshot.variationDetails,
		price: snapshot.price,
		oldPrice: snapshot.oldPrice,
		quantity: snapshot.quantity,
		stockQuantity: snapshot.stockQuantity,
		inStock: snapshot.stockQuantity > 0,
	};

	const subtotal = item.price * item.quantity;
	const discount = appliedCoupon?.discountAmount ?? 0;
	const total = subtotal + (shippingFee ?? 0) - discount;

	const handlePlaceOrder = () => {
		if (!selectedAddressId) {
			toast.error("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
			return;
		}
		if (!item.inStock) {
			toast.error("Sản phẩm này đã hết hàng hoặc ngừng kinh doanh, vui lòng quay lại trang sản phẩm để kiểm tra.");
			return;
		}
		if (shippingFeeQuery.isLoading || shippingFeeQuery.isError || shippingFee === null) {
			toast.error("Chưa tính được phí vận chuyển cho địa chỉ này, vui lòng thử lại hoặc đổi địa chỉ khác.");
			return;
		}
		const payload = {
			productSkuId: snapshot.productSkuId,
			quantity: snapshot.quantity,
			shippingAddressId: selectedAddressId,
			paymentMethod,
			couponCode: appliedCoupon?.code,
			idempotencyKey,
		};
		buyNow.mutate(payload, {
			onSuccess: (res) => {
				const order = res.data.data;
				// Cùng logic điều hướng sau đặt hàng như PaymentPage: online gateway -> lấy URL rồi
				// redirect thẳng sang trang gateway; COD/còn lại -> thẳng trang kết quả đặt hàng.
				if (ONLINE_GATEWAY_METHODS.includes(paymentMethod)) {
					createPaymentUrl.mutate(order.id, {
						onSuccess: (urlRes) => {
							window.location.href = urlRes.data.data.url;
						},
						onError: () => {
							navigate(paths.client.account, { state: { tab: "orders" } });
						},
					});
					return;
				}
				navigate(`${paths.client.paymentResult}?orderId=${order.id}`);
			},
		});
	};

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
						<CheckoutProductSection items={[item]} />
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
								isPlacingOrder={buyNow.isPending || createPaymentUrl.isPending}
								disabled={!selectedAddressId}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default BuyNowPage;
