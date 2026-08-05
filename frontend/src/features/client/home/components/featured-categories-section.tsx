import { Link } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import Loading from "../../../../shared/components/loading";
import { useCategoriesQuery, useFeaturedCategoriesQuery } from "../../product/hooks";
import type { PublicCategory } from "../../product/types";

const FEATURED_CATEGORIES_LIMIT = 10;

/** Ảnh đại diện cho danh mục — Category ở backend không có field ảnh riêng, dùng placeholder theo tên. */
const getCategoryImage = (name: string) => `https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=${encodeURIComponent(name)}`;

/**
 * Danh mục nổi bật (is_featured=true, cấu hình ở trang quản trị). Nếu admin chưa đánh dấu danh mục
 * nào là nổi bật, dùng tạm danh mục có nhiều sản phẩm nhất để mục này không bị bỏ trống.
 */
const FeaturedCategoriesSection = () => {
	const { data: featuredCategoriesData, isLoading: isFeaturedCategoriesLoading } = useFeaturedCategoriesQuery(FEATURED_CATEGORIES_LIMIT);
	const featuredCategories = featuredCategoriesData?.data ?? [];
	const shouldFallback = !isFeaturedCategoriesLoading && featuredCategories.length === 0;

	const { data: allCategoriesData, isLoading: isAllCategoriesLoading } = useCategoriesQuery({ limit: FEATURED_CATEGORIES_LIMIT }, { enabled: shouldFallback });
	const fallbackCategories = [...(allCategoriesData?.data ?? [])].sort((a, b) => b._count.products - a._count.products);

	const isLoading = isFeaturedCategoriesLoading || (shouldFallback && isAllCategoriesLoading);
	const displayedCategories: PublicCategory[] = featuredCategories.length > 0 ? featuredCategories : fallbackCategories;

	return (
		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
			<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Danh mục nổi bật</h2>
			{isLoading ? (
				<div className='mt-8'>
					<Loading size='sm' fullPage={false} />
				</div>
			) : displayedCategories.length > 0 ? (
				<div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
					{displayedCategories.map((category) => (
						<Link
							key={category.slug}
							to={`${paths.client.shop}?categoryId=${category.id}`}
							className='group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-colors hover:border-primary'>
							<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cream-soft'>
								<img src={getCategoryImage(category.name)} alt={category.name} className='h-full w-full object-cover' />
							</div>
							<span className='text-sm font-semibold text-ink group-hover:text-primary-dark'>{category.name}</span>
							<span className='text-xs text-muted'>{category._count.products} sản phẩm</span>
						</Link>
					))}
				</div>
			) : (
				<p className='mt-8 text-sm text-muted'>Chưa có danh mục nào để hiển thị.</p>
			)}
		</section>
	);
};

export default FeaturedCategoriesSection;
