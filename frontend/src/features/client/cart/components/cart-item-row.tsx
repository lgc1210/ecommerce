import { Link } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import { TrashIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { formatVariationDetails } from "../../product/utils";
import type { CartLineView } from "../types";
import Button from "../../../../components/button";
import QuantityStepper from "../../../../shared/components/quantity-stepper";

interface CartItemRowProps {
	line: CartLineView;
	onQuantityChange: (quantity: number) => void;
	onRemove: () => void;
}

const CartItemRow = ({ line, onQuantityChange, onRemove }: CartItemRowProps) => {
	const variationLabel = formatVariationDetails(line.variationDetails);

	return (
		<div className='flex gap-4 border-b border-border py-5 last:border-0'>
			<Link to={paths.client.productDetail(line.productSlug)} className='h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-soft'>
				<img src={line.image} alt={line.productName} className='h-full w-full object-cover' />
			</Link>

			<div className='flex flex-1 flex-col'>
				<div className='flex items-start justify-between gap-3'>
					<div className='space-y-1'>
						<Link to={paths.client.productDetail(line.productSlug)} className='block line-clamp-2 text-sm font-semibold text-ink hover:text-primary-dark' viewTransition>
							{line.productName}
						</Link>
						{variationLabel && <p className='text-xs text-muted'>{variationLabel}</p>}
						<div className='w-full flex flex-col sm:flex-row sm:items-center sm:gap-2'>
							{Boolean(line.oldPrice) && <p className='text-xs text-muted line-through'>{formatCurrency(Number(line.oldPrice))}</p>}
							<p className='text-sm font-bold text-primary-dark'>{formatCurrency(line.price)}</p>
						</div>
						{!line.inStock && <p className='mt-1 text-xs font-semibold text-red-600'>Sản phẩm đã hết hàng hoặc ngừng kinh doanh</p>}
					</div>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={onRemove}
						aria-label='Xóa khỏi giỏ hàng'
						className='shrink-0 text-muted hover:text-red-600 p-0! px-2! bg-transparent!'
						icon={<TrashIcon className='h-4.5 w-4.5' />}
					/>
				</div>
				<div className='mt-auto flex flex-wrap sm:gap-0 gap-3 items-center justify-end sm:justify-between pt-3'>
					<QuantityStepper btnSize='sm' value={line.quantity} max={line.stockQuantity} disabled={!line.inStock} onChange={onQuantityChange} />
					<div className='flex items-center gap-2'>
						<p className='text-ink-soft/70 text-sm'>Tổng: </p>
						<p className='text-sm font-bold text-primary-dark'>{formatCurrency(line.price * line.quantity)}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartItemRow;
