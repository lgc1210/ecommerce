import Skeleton, { SkeletonProductGrid } from "../../../shared/components/skeleton";

/** Skeleton cho danh sách checkbox danh mục trong FilterPanel của trang Shop khi đang tải cây danh mục. */
export const ShopCategoryFilterSkeleton = () => (
	<ul className='space-y-3'>
		{Array.from({ length: 6 }).map((_, i) => (
			<li key={i} className='flex items-center gap-2.5'>
				<Skeleton className='h-4 w-4 rounded' />
				<Skeleton className='h-3.5 flex-1' style={{ maxWidth: `${70 - i * 5}%` }} />
			</li>
		))}
	</ul>
);

/** Skeleton cho lưới sản phẩm trang Shop khi đang tải danh sách theo bộ lọc/sắp xếp hiện tại. */
export const ShopPageSkeleton = () => <SkeletonProductGrid count={12} className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3' />;
