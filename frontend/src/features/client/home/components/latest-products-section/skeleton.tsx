import { SkeletonProductGrid } from "../../../../../shared/components/skeleton";

/** Skeleton cho lưới sản phẩm mới nhất trên trang chủ khi đang tải. */
const LatestProductsSectionSkeleton = () => <SkeletonProductGrid count={6} className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6' />;

export default LatestProductsSectionSkeleton;
