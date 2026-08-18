import ProductCard from "../../../product/components/product-card";
import { productSort } from "../../../product/constants";
import { useProductsQuery } from "../../../product/hooks";
import { toProductCardItem } from "../../../product/utils";
import { HOME_PRODUCTS_LIMIT } from "../../constants";
import PopularProductsSectionSkeleton from "./skeleton";

/** Được yêu thích nhất — GET /products?sort=popular (sắp xếp theo số lượng đánh giá giảm dần). */
const PopularProductsSection = () => {
	const { data, isLoading } = useProductsQuery({ limit: HOME_PRODUCTS_LIMIT, sort: productSort.popular });
	const products = data?.data ?? [];

	return (
		<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
			<div className='text-center'>
				<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Được yêu thích nhất</h2>
				<p className='mx-auto mt-2 max-w-md text-sm text-muted'>Những sản phẩm được khách hàng lựa chọn và đánh giá cao nhất trong tháng.</p>
			</div>
			{isLoading ? (
				<PopularProductsSectionSkeleton />
			) : products.length > 0 ? (
				<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
					{products.map((product) => (
						<ProductCard key={product.slug} product={toProductCardItem(product)} />
					))}
				</div>
			) : (
				<p className='mt-8 text-center text-sm text-muted'>Chưa có sản phẩm nào để hiển thị.</p>
			)}
		</section>
	);
};

export default PopularProductsSection;
