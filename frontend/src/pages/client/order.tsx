import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { mockProducts } from "../../configs/constants/mock-data";
import { MinusIcon, PlusIcon, TrashIcon } from "../../components/icons";
import { formatCurrency } from "../../utils/currency";

type CartLine = {
	slug: string;
	quantity: number;
};

const SHIPPING_FEE = 30000;

const OrderPage = () => {
	const [cart, setCart] = useState<CartLine[]>([
		{ slug: mockProducts[0].slug, quantity: 1 },
		{ slug: mockProducts[2].slug, quantity: 2 },
	]);
	const [coupon, setCoupon] = useState("");
	const [appliedDiscount, setAppliedDiscount] = useState(0);

	const lines = useMemo(
		() =>
			cart
				.map((line) => {
					const product = mockProducts.find((p) => p.slug === line.slug);
					return product ? { product, quantity: line.quantity } : null;
				})
				.filter(
					(
						line,
					): line is {
						product: (typeof mockProducts)[number];
						quantity: number;
					} => Boolean(line),
				),
		[cart],
	);

	const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
	const shipping = lines.length > 0 ? SHIPPING_FEE : 0;
	const total = Math.max(0, subtotal + shipping - appliedDiscount);

	const updateQuantity = (slug: string, quantity: number) => {
		setCart((prev) => prev.map((line) => (line.slug === slug ? { ...line, quantity: Math.max(1, quantity) } : line)));
	};

	const removeLine = (slug: string) => {
		setCart((prev) => prev.filter((line) => line.slug !== slug));
	};

	const applyCoupon = () => {
		if (coupon.trim().toUpperCase() === "ETONAL25") {
			setAppliedDiscount(Math.round(subtotal * 0.25));
			toast.success("Áp dụng mã giảm giá thành công: -25%");
		} else {
			toast.error("Mã giảm giá không hợp lệ.");
		}
	};

	return (
		<div>
			<BreadCrumb title='Giỏ hàng' description='Xem lại sản phẩm trước khi tiến hành thanh toán.' />

			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				{lines.length === 0 ? (
					<div className='py-16 text-center'>
						<p className='text-lg font-semibold text-ink'>Giỏ hàng của bạn đang trống.</p>
						<Link to={paths.client.shop}>
							<Button className='mt-6'>Tiếp tục mua sắm</Button>
						</Link>
					</div>
				) : (
					<div className='grid gap-10 lg:grid-cols-[1fr_360px]'>
						{/* Cart lines */}
						<div className='space-y-4'>
							{lines.map(({ product, quantity }) => (
								<div
									key={product.slug}
									className='flex items-center gap-4 rounded-2xl border border-border bg-surface p-4'>
									<img src={product.image} alt={product.name} className='h-20 w-20 shrink-0 rounded-xl object-cover' />
									<div className='min-w-0 flex-1'>
										<Link
											to={paths.client.productDetail(product.slug)}
											className='line-clamp-1 font-semibold text-ink hover:text-primary-dark'>
											{product.name}
										</Link>
										<p className='mt-1 text-sm font-bold text-primary-dark'>{formatCurrency(product.price)}</p>
									</div>

									<div className='flex items-center rounded-full border border-border'>
										<button
											type='button'
											onClick={() => updateQuantity(product.slug, quantity - 1)}
											className='flex h-9 w-9 items-center justify-center text-ink hover:text-primary-dark'
											aria-label='Giảm số lượng'>
											<MinusIcon className='h-3.5 w-3.5' />
										</button>
										<span className='w-7 text-center text-sm font-semibold text-ink'>{quantity}</span>
										<button
											type='button'
											onClick={() => updateQuantity(product.slug, quantity + 1)}
											className='flex h-9 w-9 items-center justify-center text-ink hover:text-primary-dark'
											aria-label='Tăng số lượng'>
											<PlusIcon className='h-3.5 w-3.5' />
										</button>
									</div>

									<p className='hidden w-28 text-right font-bold text-ink sm:block'>
										{formatCurrency(product.price * quantity)}
									</p>

									<button
										type='button'
										onClick={() => removeLine(product.slug)}
										aria-label='Xoá sản phẩm'
										className='text-muted hover:text-red-600'>
										<TrashIcon className='h-5 w-5' />
									</button>
								</div>
							))}
						</div>

						{/* Summary */}
						<div className='h-fit rounded-2xl border border-border bg-surface p-6'>
							<h2 className='text-lg font-bold text-ink'>Tóm tắt đơn hàng</h2>

							<div className='mt-4 flex gap-2'>
								<input
									value={coupon}
									onChange={(e) => setCoupon(e.target.value)}
									placeholder='Mã giảm giá (ETONAL25)'
									className='h-11 flex-1 rounded-full border border-border bg-cream-soft px-4 text-sm text-ink outline-none focus:border-primary'
								/>
								<button
									type='button'
									onClick={applyCoupon}
									className='rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft'>
									Áp dụng
								</button>
							</div>

							<div className='mt-6 space-y-3 border-t border-border pt-4 text-sm'>
								<div className='flex justify-between text-muted'>
									<span>Tạm tính</span>
									<span className='text-ink'>{formatCurrency(subtotal)}</span>
								</div>
								<div className='flex justify-between text-muted'>
									<span>Phí vận chuyển</span>
									<span className='text-ink'>{formatCurrency(shipping)}</span>
								</div>
								{appliedDiscount > 0 && (
									<div className='flex justify-between text-primary-dark'>
										<span>Giảm giá</span>
										<span>-{formatCurrency(appliedDiscount)}</span>
									</div>
								)}
								<div className='flex justify-between border-t border-border pt-3 text-base font-bold text-ink'>
									<span>Tổng cộng</span>
									<span>{formatCurrency(total)}</span>
								</div>
							</div>

							<Button fullWidth className='mt-6'>
								Tiến hành thanh toán
							</Button>
							<Link
								to={paths.client.shop}
								className='mt-3 block text-center text-sm font-semibold text-primary-dark hover:underline'>
								Tiếp tục mua sắm
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default OrderPage;
