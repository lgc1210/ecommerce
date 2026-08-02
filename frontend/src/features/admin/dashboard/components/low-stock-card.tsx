import { Link } from "react-router-dom";
import { useDashboardLowStockQuery } from "../hooks";
import paths from "../../../../configs/constants/paths";
import Skeleton from "./skeleton";

const THRESHOLD = 10;
const LIMIT = 8;

const LowStockSkeletonRow = () => (
	<div className='flex items-center justify-between gap-3 px-2 py-2.5'>
		<div className='min-w-0 flex-1 space-y-1.5'>
			<Skeleton className='h-4 w-2/3' />
			<Skeleton className='h-3 w-1/3' />
		</div>
		<Skeleton className='h-6 w-20 flex-none rounded-full' />
	</div>
);

/** Cảnh báo tồn kho thấp cho các SKU — GET /dashboard/low-stock?threshold=10. */
const LowStockCard = () => {
	const { data, isLoading } = useDashboardLowStockQuery({ threshold: THRESHOLD, limit: LIMIT });
	const items = data ?? [];

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<h3 className='text-base font-bold text-ink'>Sắp hết hàng</h3>
			<p className='mt-0.5 text-xs text-muted'>Tồn kho ≤ {THRESHOLD}, cần nhập thêm.</p>

			<div className='mt-4 space-y-1'>
				{isLoading ? (
					Array.from({ length: 5 }).map((_, i) => <LowStockSkeletonRow key={i} />)
				) : items.length === 0 ? (
					<p className='py-6 text-center text-sm text-muted'>Không có sản phẩm nào sắp hết hàng.</p>
				) : (
					items.map((item) => (
						<Link
							key={item.id}
							to={item.product ? paths.admin.productDetail(item.product.id) : "#"}
							className='flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-cream-soft/60'>
							<div className='min-w-0'>
								<p className='truncate text-sm font-semibold text-ink'>{item.product?.name ?? "(Đã xóa)"}</p>
								<p className='truncate text-xs text-muted'>SKU: {item.sku}</p>
							</div>
							<span
								className={`flex-none rounded-full px-2.5 py-1 text-xs font-semibold ${
									item.stockQuantity === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
								}`}>
								{item.stockQuantity === 0 ? "Hết hàng" : `Còn ${item.stockQuantity}`}
							</span>
						</Link>
					))
				)}
			</div>
		</div>
	);
};

export default LowStockCard;
