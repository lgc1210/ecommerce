import { Link } from "react-router-dom";
import type { ProductCardItem } from "../types";
import paths from "../../../../configs/constants/paths";
import { CartIcon, StarIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";

interface ProductCardProps {
	product: ProductCardItem;
}

const ProductCard = ({ product }: ProductCardProps) => {
	const discountPercent = product.oldPrice
		? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
		: null;

	return (
		<div className='group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg hover:shadow-ink/5'>
			<Link
				to={paths.client.productDetail(product.slug)}
				className='relative block aspect-square overflow-hidden bg-cream-soft'>
				<img
					src={product.image}
					alt={product.name}
					className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
				/>
				{discountPercent && (
					<span className='absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white'>
						-{discountPercent}%
					</span>
				)}
				{!product.inStock && (
					<span className='absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white'>
						Hết hàng
					</span>
				)}

				<button
					type='button'
					aria-label='Thêm vào giỏ hàng'
					onClick={(e) => e.preventDefault()}
					disabled={!product.inStock}
					className='absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-ink text-white opacity-0 shadow-md transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary disabled:pointer-events-none'>
					<CartIcon className='h-4 w-4' />
				</button>
			</Link>

			<div className='flex flex-1 flex-col gap-1.5 p-4'>
				{/* Danh sách công khai (GET /products) không trả điểm đánh giá trung bình, chỉ có số lượng review
				    -> khi không có rating (dữ liệu thật), chỉ hiện số lượng đánh giá, không vẽ hàng sao. */}
				{product.rating !== undefined ? (
					<div className='flex items-center gap-1 text-primary'>
						{Array.from({ length: 5 }).map((_, i) => (
							<StarIcon
								key={i}
								className={`h-3.5 w-3.5 ${i < Math.round(product.rating!) ? "text-primary" : "text-border"}`}
							/>
						))}
						<span className='ml-1 text-xs text-muted'>({product.reviewCount})</span>
					</div>
				) : (
					<span className='text-xs text-muted'>{product.reviewCount} đánh giá</span>
				)}

				<Link
					to={paths.client.productDetail(product.slug)}
					className='line-clamp-1 text-sm font-semibold text-ink hover:text-primary-dark'>
					{product.name}
				</Link>

				<div className='mt-auto flex items-center gap-2 pt-1'>
					<span className='text-base font-bold text-primary-dark'>{formatCurrency(product.price)}</span>
					{product.oldPrice && (
						<span className='text-xs text-muted line-through'>{formatCurrency(product.oldPrice)}</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
