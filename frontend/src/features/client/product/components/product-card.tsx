import { Link } from "react-router-dom";
import type { ProductCardItem } from "../types";
import paths from "../../../../configs/constants/paths";
import { StarIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { usePrefetchProductDetail } from "../hooks";

interface ProductCardProps {
	product: ProductCardItem;
}

const ProductCard = ({ product }: ProductCardProps) => {
	const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;
	// undefined (vd: MockProduct ở trang Home) coi như đang kinh doanh bình thường.
	const isDiscontinued = product.isActive === false;

	// 2. Khởi tạo hàm prefetch từ custom hook
	const prefetchProductDetail = usePrefetchProductDetail();

	// 3. Hàm xử lý kiểm tra điều kiện trước khi trigger prefetch
	const handleMouseEnter = () => {
		if (!isDiscontinued && product.slug) {
			prefetchProductDetail(product.slug);
		}
	};

	const media = (
		<>
			<img src={product.image} alt={product.name} className={`h-full w-full object-cover transition-transform duration-300 ${isDiscontinued ? "grayscale" : "group-hover:scale-105"}`} />
			{discountPercent && !isDiscontinued && <span className='absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white'>-{discountPercent}%</span>}
			{isDiscontinued ? (
				<span className='absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white'>Ngừng kinh doanh</span>
			) : (
				!product.inStock && <span className='absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white'>Hết hàng</span>
			)}
		</>
	);

	return (
		<div
			className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow ${isDiscontinued ? "opacity-60" : "hover:shadow-lg hover:shadow-ink/5"}`}
			onMouseEnter={handleMouseEnter}>
			{/* Sản phẩm ngừng kinh doanh: không cho bấm vào (trang chi tiết công khai vẫn trả 404 cho sản
			    phẩm inactive), chỉ hiển thị để người dùng biết sản phẩm này từng tồn tại, vd: trong lịch sử đơn hàng. */}
			{isDiscontinued ? (
				<div aria-disabled='true' className='relative block aspect-square cursor-not-allowed overflow-hidden bg-cream-soft'>
					{media}
				</div>
			) : (
				<Link to={paths.client.productDetail(product.slug)} viewTransition className='relative block aspect-square overflow-hidden bg-cream-soft'>
					{media}
				</Link>
			)}

			<div className='flex flex-1 flex-col gap-1.5 p-4'>
				{/* Danh sách công khai (GET /products) không trả điểm đánh giá trung bình, chỉ có số lượng review
				    -> khi không có rating (dữ liệu thật), chỉ hiện số lượng đánh giá, không vẽ hàng sao. */}
				{product.rating !== undefined ? (
					<div className='flex items-center gap-1 text-primary'>
						{Array.from({ length: 5 }).map((_, i) => (
							<StarIcon key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating!) ? "text-primary" : "text-border"}`} />
						))}
						<span className='ml-1 text-xs text-muted'>({product.reviewCount})</span>
					</div>
				) : (
					<span className='text-xs text-muted'>{product.reviewCount} đánh giá</span>
				)}

				{isDiscontinued ? (
					<span className='line-clamp-1 cursor-not-allowed text-sm font-semibold text-ink/60'>{product.name}</span>
				) : (
					<Link to={paths.client.productDetail(product.slug)} viewTransition className='line-clamp-1 text-sm font-semibold text-ink hover:text-primary-dark'>
						<span className='block'>{product.name}</span>
					</Link>
				)}

				<div className='mt-auto flex items-center gap-2 pt-1'>
					<span className='text-base font-bold text-primary-dark'>{formatCurrency(product.price)}</span>
					{product.oldPrice && <span className='text-xs text-muted line-through'>{formatCurrency(product.oldPrice)}</span>}
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
