import { Link } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import { ChevronRightIcon } from "../../../../components/icons";
import Loading from "../../../../shared/components/loading";
import ProductCard from "../../product/components/product-card";
import { useProductsQuery } from "../../product/hooks";
import { toProductCardItem } from "../../product/utils";
import { HOME_PRODUCTS_LIMIT } from "../constants";
import { productSort } from "../../product/constants";

/** Sản phẩm mới nhất — GET /products?sort=newest. */
const LatestProductsSection = () => {
	const { data, isLoading } = useProductsQuery({ limit: HOME_PRODUCTS_LIMIT, sort: productSort.newest });
	const products = data?.data ?? [];

	return (
		<section className='border-y border-border bg-cream-soft'>
			<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between'>
					<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Sản phẩm mới nhất</h2>
					<Link to={paths.client.shop} className='hidden items-center gap-1 text-sm font-semibold text-primary-dark hover:underline sm:flex cursor-default!'>
						Xem tất cả <ChevronRightIcon className='h-4 w-4' />
					</Link>
				</div>
				{isLoading ? (
					<div className='mt-8'>
						<Loading size='sm' fullPage={false} />
					</div>
				) : products.length > 0 ? (
					<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
						{products.map((product) => (
							<ProductCard key={product.slug} product={toProductCardItem(product)} />
						))}
					</div>
				) : (
					<p className='mt-8 text-sm text-muted'>Chưa có sản phẩm nào để hiển thị.</p>
				)}
			</div>
		</section>
	);
};

export default LatestProductsSection;
