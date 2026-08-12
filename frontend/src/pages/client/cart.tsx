import { Link } from "react-router-dom";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { formatCurrency } from "../../utils/currency";
import { CartIcon } from "../../components/icons";
import { useCart } from "../../features/client/cart/hooks";
import CartItemRow from "../../features/client/cart/components/cart-item-row";

const CartPage = () => {
	const { items, subtotal, isLoading, updateQuantity, removeItem, clearCart } = useCart();

	if (isLoading) {
		return <div className='mx-auto max-w-7xl px-4 py-24 text-center text-muted sm:px-6 lg:px-8'>Đang tải giỏ hàng...</div>;
	}

	if (items.length === 0) {
		return (
			<div>
				<BreadCrumb title='Giỏ hàng' />
				<div className='mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8'>
					<CartIcon className='mx-auto h-12 w-12 text-muted' />
					<h1 className='mt-4 text-2xl font-bold text-ink'>Giỏ hàng của bạn đang trống</h1>
					<p className='mt-2 text-muted'>Hãy khám phá cửa hàng và thêm sản phẩm bạn yêu thích vào giỏ.</p>
					<Link to={paths.client.shop} viewTransition>
						<Button className='mt-6'>Tiếp tục mua sắm</Button>
					</Link>
				</div>
			</div>
		);
	}

	const hasUnavailableItems = items.some((line) => !line.inStock);

	return (
		<div>
			<BreadCrumb title='Giỏ hàng' />
			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				<div className='grid gap-10 lg:grid-cols-3'>
					{/* Danh sách sản phẩm */}
					<div className='lg:col-span-2'>
						<div className='rounded-2xl border border-border bg-surface px-5'>
							{items.map((line) => (
								<CartItemRow key={line.id} line={line} onQuantityChange={(quantity) => updateQuantity(line, quantity)} onRemove={() => removeItem(line)} />
							))}
						</div>
						<Button type='button' variant='ghost' size='sm' onClick={clearCart} className='text-muted! hover:text-red-600! bg-transparent!'>
							Xoá toàn bộ giỏ hàng
						</Button>
					</div>

					{/* Tóm tắt đơn hàng */}
					<div className='h-fit rounded-2xl border border-border bg-surface p-6'>
						<h2 className='text-lg font-bold text-ink'>Tóm tắt đơn hàng</h2>

						<div className='mt-4 flex items-center justify-between text-sm'>
							<span className='text-muted'>Tạm tính</span>
							<span className='font-semibold text-ink'>{formatCurrency(subtotal)}</span>
						</div>
						<p className='mt-1 text-xs text-muted'>Phí vận chuyển và các ưu đãi (nếu có) được tính ở bước thanh toán.</p>

						{hasUnavailableItems && (
							<p className='mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600'>Một số sản phẩm trong giỏ đã hết hàng hoặc ngừng kinh doanh, vui lòng xóa trước khi thanh toán.</p>
						)}

						<Link to={paths.client.payment} viewTransition>
							<Button fullWidth className='mt-6' disabled={hasUnavailableItems}>
								Tiến hành thanh toán
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartPage;
