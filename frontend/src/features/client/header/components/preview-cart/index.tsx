import { Link } from "react-router-dom";
import HoverPreview from "../../../../../shared/components/hover-preview";
import paths from "../../../../../configs/constants/paths";
import { CartIcon } from "../../../../../components/icons";
import { useCart } from "../../../cart/hooks";
import { formatCurrency } from "../../../../../utils/currency";
import { CartPreviewCountSkeleton, CartPreviewListSkeleton } from "./skeleton";

const PreviewCart = () => {
	const { totalQuantity, items, isLoading } = useCart();

	return (
		<HoverPreview
			trigger={
				<Link
					to={paths.client.cart}
					aria-label='Giỏ hàng'
					aria-haspopup='dialog'
					className='relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft cursor-default'
					viewTransition>
					<CartIcon className='h-5 w-5' />

					{totalQuantity > 0 && (
						<span className='absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white'>
							{totalQuantity > 99 ? "99+" : totalQuantity}
						</span>
					)}
				</Link>
			}>
			<div className='flex items-center justify-between border-b border-border px-4 py-3'>
				<p className='font-bold text-ink'>Giỏ hàng</p>
				{isLoading ? <CartPreviewCountSkeleton /> : <span className='text-sm text-muted'>{totalQuantity} sản phẩm</span>}
			</div>

			{isLoading ? (
				<CartPreviewListSkeleton />
			) : items.length === 0 ? (
				<div className='px-4 py-8 text-center text-sm text-muted'>Giỏ hàng của bạn đang trống.</div>
			) : (
				<>
					<div className='max-h-80 overflow-y-auto p-2'>
						{items.slice(0, 4).map((item) => (
							<Link key={item.id} to={paths.client.productDetail(item.productSlug)} className='flex gap-3 rounded-lg p-2 hover:bg-cream-soft cursor-default!' viewTransition>
								<img src={item.image} alt={item.productName} className='h-14 w-14 shrink-0 rounded-md object-cover' />
								<div className='min-w-0 flex-1'>
									<p className='truncate text-sm font-semibold text-ink'>{item.productName}</p>
									<p className='mt-0.5 truncate text-xs text-muted'>{Object.values(item.variationDetails ?? {}).join(" · ")}</p>
									<div className='mt-1 flex items-center justify-between gap-2'>
										<span className='text-sm font-bold text-primary-dark'>{formatCurrency(item.price)}</span>
										<span className='text-xs text-muted'>× {item.quantity}</span>
									</div>
								</div>
							</Link>
						))}
					</div>

					<div className='border-t border-border p-3'>
						<Link
							to={paths.client.cart}
							className='flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark cursor-default!'
							viewTransition>
							Xem giỏ hàng
						</Link>
					</div>
				</>
			)}
		</HoverPreview>
	);
};

export default PreviewCart;
