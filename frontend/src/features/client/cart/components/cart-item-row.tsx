import { Link } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import { MinusIcon, PlusIcon, TrashIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { formatVariationDetails } from "../../product/utils";
import type { CartLineView } from "../types";

interface CartItemRowProps {
	line: CartLineView;
	onQuantityChange: (quantity: number) => void;
	onRemove: () => void;
}

const CartItemRow = ({ line, onQuantityChange, onRemove }: CartItemRowProps) => {
	const variationLabel = formatVariationDetails(line.variationDetails);

	return (
		<div className='flex gap-4 border-b border-border py-5 last:border-0'>
			<Link
				to={paths.client.productDetail(line.productSlug)}
				className='h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-soft'>
				<img src={line.image} alt={line.productName} className='h-full w-full object-cover' />
			</Link>

			<div className='flex flex-1 flex-col'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<Link
							to={paths.client.productDetail(line.productSlug)}
							className='line-clamp-2 text-sm font-semibold text-ink hover:text-primary-dark'>
							{line.productName}
						</Link>
						{variationLabel && <p className='mt-1 text-xs text-muted'>{variationLabel}</p>}
						{!line.inStock && (
							<p className='mt-1 text-xs font-semibold text-red-600'>Sản phẩm đã hết hàng hoặc ngừng kinh doanh</p>
						)}
					</div>
					<button
						type='button'
						onClick={onRemove}
						aria-label='Xóa khỏi giỏ hàng'
						className='shrink-0 text-muted hover:text-red-600'>
						<TrashIcon className='h-4.5 w-4.5' />
					</button>
				</div>

				<div className='mt-auto flex items-center justify-between pt-3'>
					<div className='flex items-center rounded-full border border-border'>
						<button
							type='button'
							onClick={() => onQuantityChange(line.quantity - 1)}
							className='flex h-9 w-9 items-center justify-center text-ink hover:text-primary-dark'
							aria-label='Giảm số lượng'>
							<MinusIcon className='h-3.5 w-3.5' />
						</button>
						<span className='w-8 text-center text-sm font-semibold text-ink'>{line.quantity}</span>
						<button
							type='button'
							onClick={() => onQuantityChange(line.quantity + 1)}
							disabled={line.quantity >= line.stockQuantity}
							className='flex h-9 w-9 items-center justify-center text-ink hover:text-primary-dark disabled:pointer-events-none disabled:opacity-40'
							aria-label='Tăng số lượng'>
							<PlusIcon className='h-3.5 w-3.5' />
						</button>
					</div>
					<span className='text-sm font-bold text-primary-dark'>{formatCurrency(line.price * line.quantity)}</span>
				</div>
			</div>
		</div>
	);
};

export default CartItemRow;
