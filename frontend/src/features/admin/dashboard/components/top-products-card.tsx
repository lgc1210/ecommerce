import { Link } from "react-router-dom";
import { useDashboardTopProductsQuery } from "../hooks";
import { formatCurrency } from "../../../../utils/currency";
import paths from "../../../../configs/constants/paths";
import Skeleton from "./skeleton";

const LIMIT = 5;

const TopProductsSkeletonRow = () => (
	<div className='flex items-center gap-3 px-2 py-2.5'>
		<Skeleton className='h-7 w-7 flex-none rounded-full' />
		<div className='min-w-0 flex-1 space-y-1.5'>
			<Skeleton className='h-4 w-3/5' />
			<Skeleton className='h-3 w-2/5' />
		</div>
		<div className='flex-none space-y-1.5 text-right'>
			<Skeleton className='ml-auto h-4 w-20' />
			<Skeleton className='ml-auto h-3 w-14' />
		</div>
	</div>
);

/** Bảng top sản phẩm bán chạy (theo số lượng đã bán trên các đơn chưa bị hủy) — GET /dashboard/top-products. */
const TopProductsCard = () => {
	const { data, isLoading } = useDashboardTopProductsQuery({ limit: LIMIT });
	const products = data ?? [];

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<h3 className='text-base font-bold text-ink'>Sản phẩm bán chạy</h3>
			<p className='mt-0.5 text-xs text-muted'>Top {LIMIT} sản phẩm theo số lượng đã bán.</p>

			<div className='mt-4 space-y-1'>
				{isLoading ? (
					Array.from({ length: LIMIT }).map((_, i) => <TopProductsSkeletonRow key={i} />)
				) : products.length === 0 ? (
					<p className='py-6 text-center text-sm text-muted'>Chưa có dữ liệu bán hàng.</p>
				) : (
					products.map((product, index) => (
						<Link
							key={product.skuId}
							to={product.productId ? paths.admin.productDetail(product.productId) : "#"}
							className='flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-cream-soft/60'>
							<span className='flex h-7 w-7 flex-none items-center justify-center rounded-full bg-cream-soft text-xs font-bold text-ink/70'>
								{index + 1}
							</span>
							<div className='min-w-0 flex-1'>
								<p className='truncate text-sm font-semibold text-ink'>{product.productName}</p>
								<p className='truncate text-xs text-muted'>SKU: {product.sku}</p>
							</div>
							<div className='flex-none text-right'>
								<p className='text-sm font-semibold text-ink'>{formatCurrency(product.revenue)}</p>
								<p className='text-xs text-muted'>{product.quantitySold} đã bán</p>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
};

export default TopProductsCard;
