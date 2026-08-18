import { SkeletonProductGrid } from "../../../../../shared/components/skeleton";

/** Skeleton cho lưới sản phẩm phổ biến trên trang chủ khi đang tải. */
const PopularProductsSectionSkeleton = () => <SkeletonProductGrid count={6} className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6' />;

export default PopularProductsSectionSkeleton;
