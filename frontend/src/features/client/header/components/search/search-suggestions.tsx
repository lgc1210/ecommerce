import { Link, useNavigate } from "react-router-dom";
import paths from "../../../../../configs/constants/paths";
import { computePriceRange, getProductThumbnail } from "../../../product/utils";
import { formatCurrency } from "../../../../../utils/currency";
import { TagIcon } from "../../../../../components/icons";
import Loading from "../../../../../shared/components/loading";
import { useProductsQuery } from "../../../product/hooks";
import { productSort } from "../../../product/constants";
import { useCategoriesQuery } from "../../../category/hooks";

const SUGGESTION_LIMIT = 5;

/**
 * Gợi ý tìm kiếm nhanh (sản phẩm + danh mục khớp từ khoá) hiển thị bên dưới ô tìm kiếm — dùng
 * chung cho cả thanh tìm kiếm desktop (dropdown) và overlay tìm kiếm mobile (inline).
 */
interface SearchSuggestionsProps {
	query: string;
	onNavigate: () => void;
}

const SearchSuggestions = ({ query, onNavigate }: SearchSuggestionsProps) => {
	const navigate = useNavigate();

	const { data: productsData, isFetching: isProductsFetching } = useProductsQuery({ search: query, limit: SUGGESTION_LIMIT, sort: productSort.newest });
	const { data: categoriesData, isFetching: isCategoriesFetching } = useCategoriesQuery({ search: query, limit: 4 });

	const products = productsData?.data ?? [];
	const categories = categoriesData?.data ?? [];
	const isLoading = isProductsFetching || isCategoriesFetching;
	const hasResults = products.length > 0 || categories.length > 0;

	const goToCategory = (categoryId: number) => {
		onNavigate();
		navigate(`${paths.client.shop}?categoryId=${categoryId}`, { viewTransition: true, replace: true });
	};

	if (isLoading && !hasResults) {
		return (
			<div className='p-4'>
				<Loading size='sm' fullPage={false} />
			</div>
		);
	}

	if (!hasResults) {
		return <p className='px-4 py-6 text-center text-sm text-muted'>Không tìm thấy sản phẩm hoặc danh mục phù hợp với "{query}".</p>;
	}

	return (
		<div className='max-h-[70vh] overflow-y-auto sm:max-h-96'>
			{categories.length > 0 && (
				<div className='border-b border-border py-2'>
					<p className='px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted'>Danh mục</p>
					{categories.map((category) => (
						<button
							key={category.id}
							type='button'
							onClick={() => goToCategory(category.id)}
							className='flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-cream-soft hover:not-disabled:cursor-default'>
							<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink/70'>
								<TagIcon className='h-4 w-4' />
							</span>
							<span className='min-w-0 flex-1 truncate text-sm font-medium text-ink'>{category.name}</span>
							<span className='shrink-0 text-xs text-muted'>{category._count.products} sản phẩm</span>
						</button>
					))}
				</div>
			)}

			{products.length > 0 && (
				<div className='py-2'>
					<p className='px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted'>Sản phẩm</p>
					{products.map((product) => {
						const { min } = computePriceRange(product.skus);
						return (
							<Link
								key={product.slug}
								to={paths.client.productDetail(product.slug)}
								onClick={onNavigate}
								viewTransition
								className='flex items-center gap-3 px-4 py-2 hover:bg-cream-soft hover:not-disabled:cursor-default'>
								<span className='h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-soft'>
									<img src={getProductThumbnail(product)} alt={product.name} className='h-full w-full object-cover' />
								</span>
								<span className='min-w-0 flex-1 truncate text-sm font-medium text-ink'>{product.name}</span>
								<span className='shrink-0 text-sm font-semibold text-primary-dark'>{formatCurrency(min)}</span>
							</Link>
						);
					})}
				</div>
			)}

			<Link
				to={`${paths.client.shop}?search=${encodeURIComponent(query)}`}
				onClick={onNavigate}
				viewTransition
				className='block w-full border-t border-border py-2.5 text-center text-sm font-semibold text-primary-dark hover:bg-primary-light hover:not-disabled:cursor-default'>
				Xem tất cả kết quả cho "{query}"
			</Link>
		</div>
	);
};

export default SearchSuggestions;
