import { Link } from "react-router-dom";
import Button from "../../../../components/button";
import Carousel from "../../../../shared/components/carousel";
import paths from "../../../../configs/constants/paths";
import { formatCurrency } from "../../../../utils/currency";
import Loading from "../../../../shared/components/loading";
import { useFeaturedProductsQuery, useProductsQuery } from "../../product/hooks";
import { computePriceRange, getProductThumbnail } from "../../product/utils";
import type { PublicProductListItem } from "../../product/types";
import { HOME_PRODUCTS_LIMIT } from "../constants";
import { productSort } from "../../product/constants";

/**
 * Sản phẩm nổi bật (isFeatured=true, admin đánh dấu) — hiển thị ở carousel banner. Nếu admin chưa đánh
 * dấu sản phẩm nào, tạm dùng sản phẩm mới nhất để mục này không bị bỏ trống. Dùng chung tham số
 * (limit + sort) với LatestProductsSection nên 2 section chia sẻ cùng 1 cache, không gọi thêm API.
 */
const FeaturedProductsCarouselSection = () => {
	const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProductsQuery(HOME_PRODUCTS_LIMIT);
	const featuredProducts = featuredData?.data ?? [];
	const shouldFallback = !isFeaturedLoading && featuredProducts.length === 0;

	const { data: latestData, isLoading: isLatestLoading } = useProductsQuery({ limit: HOME_PRODUCTS_LIMIT, sort: productSort.newest }, { enabled: shouldFallback });
	const latestProducts = latestData?.data ?? [];

	const isLoading = isFeaturedLoading || (shouldFallback && isLatestLoading);
	const displayedProducts: PublicProductListItem[] = shouldFallback ? latestProducts : featuredProducts;

	return (
		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
			<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Sản phẩm nổi bật</h2>
			{isLoading ? (
				<div className='mt-8'>
					<Loading size='sm' fullPage={false} />
				</div>
			) : displayedProducts.length > 0 ? (
				<Carousel
					className='mt-8'
					items={displayedProducts}
					getKey={(product) => product.slug}
					renderItem={(product) => {
						const { min } = computePriceRange(product.skus);
						return (
							<div className='h-full flex flex-col-reverse items-center gap-6 bg-ink p-8 text-cream sm:flex-row sm:p-12'>
								<div className='flex-1 h-full flex flex-col'>
									<div className='flex-1 shrink-0'>
										<p className='text-xs font-bold uppercase tracking-wider text-primary'>Giá chỉ từ</p>
										<h3 className='mt-2 text-2xl font-extrabold sm:text-3xl'>{product.name}</h3>
										<p className='mt-2 text-2xl font-bold text-primary'>{formatCurrency(min)}</p>
										{product.description && <p className='mt-3 max-w-md text-sm text-cream/60'>{product.description}</p>}
									</div>
									<Link to={paths.client.productDetail(product.slug)} className='mt-auto'>
										<Button variant='primary' size='sm' className='mt-5'>
											Xem sản phẩm
										</Button>
									</Link>
								</div>
								<img src={getProductThumbnail(product)} alt={product.name} className='h-40 w-40 shrink-0 rounded-2xl object-cover sm:h-48 sm:w-48' />
							</div>
						);
					}}
				/>
			) : (
				<p className='mt-8 text-sm text-muted'>Chưa có sản phẩm nào để hiển thị.</p>
			)}
		</section>
	);
};

export default FeaturedProductsCarouselSection;
