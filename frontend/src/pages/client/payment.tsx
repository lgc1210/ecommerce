import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { CartIcon } from "../../components/icons";
import { PAYMENT_METHOD } from "../../features/client/payment/constants";
import { useCart } from "../../features/client/cart/hooks";
import CheckoutAddressSection from "../../features/client/payment/components/checkout-address-section";
import CheckoutProductSection from "../../features/client/payment/components/checkout-product-section";
import CheckoutDeliveryMethodSection from "../../features/client/payment/components/checkout-delivery-method-section";
import CheckoutPaymentMethodSection from "../../features/client/payment/components/checkout-payment-method-section";
import CheckoutDiscountSection from "../../features/client/payment/components/checkout-discount-section";
import CheckoutSummarySection from "../../features/client/payment/components/checkout-summary-section";

const PaymentPage = () => {
	const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHOD.cod);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

	// Giỏ hàng thật (cùng nguồn dữ liệu với trang /cart) — không còn dùng mock nữa.
	const { items, subtotal, isLoading: isCartLoading } = useCart();

	const shippingFee = 30000;
	const discount = 100000;

	const total = subtotal + shippingFee - discount;

	const handlePlaceOrder = () => {
		if (!selectedAddressId) {
			toast.error("Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.");
			return;
		}

		if (items.some((item) => !item.inStock)) {
			toast.error("Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng kinh doanh, vui lòng quay lại giỏ hàng để xóa.");
			return;
		}

		// TODO: mã giảm giá và tạo đơn hàng (POST /orders với shippingAddressId, paymentMethod,
		// couponCode — đơn hàng được backend dựng trực tiếp từ giỏ hàng của user, không cần gửi
		// kèm danh sách sản phẩm) hiện vẫn là mock, sẽ được nối API ở bước tiếp theo.
	};

	if (isCartLoading) {
		return (
			<div className='mx-auto max-w-7xl px-4 py-24 text-center text-muted sm:px-6 lg:px-8'>Đang tải giỏ hàng...</div>
		);
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

	return (
		<>
			<BreadCrumb title='Thanh toán' description='Xác nhận đơn hàng và hoàn tất thanh toán' />

			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<div className='grid gap-8 lg:grid-cols-12'>
					{/* LEFT */}
					<div className='space-y-6 lg:col-span-8'>
						<CheckoutAddressSection
							selectedAddressId={selectedAddressId}
							onSelectAddress={(address) => setSelectedAddressId(address.id)}
						/>
						<CheckoutProductSection items={items} />
						<CheckoutDeliveryMethodSection />
						<CheckoutPaymentMethodSection value={paymentMethod} onChange={setPaymentMethod} />
					</div>

					{/* RIGHT */}
					<div className='lg:col-span-4'>
						<div className='sticky top-24 space-y-6'>
							<CheckoutDiscountSection />
							<CheckoutSummarySection
								subtotal={subtotal}
								shippingFee={shippingFee}
								discount={discount}
								total={total}
								onPlaceOrder={handlePlaceOrder}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PaymentPage;
