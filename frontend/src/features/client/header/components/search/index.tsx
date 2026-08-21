import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import paths from "../../../../../configs/constants/paths";
import { CloseIcon, SearchIcon, TagIcon } from "../../../../../components/icons";
import { formatCurrency } from "../../../../../utils/currency";
import Overlay from "../../../../../components/overlay";
import Button from "../../../../../components/button";
import FormControl from "../../../../../components/form-control";
import Loading from "../../../../../shared/components/loading";
import useDebounced from "../../../../../hooks/useDebounced";
import { useProductsQuery } from "../../../product/hooks";
import { useCategoriesQuery, useCategoryTreeQuery } from "../../../category/hooks";
import { computePriceRange, getProductThumbnail } from "../../../product/utils";
import { CategoryTreeMenu, CategoryTreeMenuSkeleton } from "../category-filter";
import { productSort } from "../../../product/constants";

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

/**
 * Ô tìm kiếm sản phẩm/danh mục trên header, cho phép người dùng tìm và nhảy thẳng tới sản phẩm/
 * danh mục mong muốn mà không cần vào trang Cửa hàng. Responsive: desktop mặc định chỉ hiện icon
 * kính lúp, bấm vào mới bung ra ô tìm kiếm nổi kèm dropdown gợi ý; mobile cũng thu gọn thành icon,
 * bấm vào mở overlay toàn màn hình (gồm ô tìm kiếm + danh mục để duyệt nhanh).
 */
const Search = () => {
	const navigate = useNavigate();

	const [query, setQuery] = useState("");
	const [desktopOpen, setDesktopOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const debouncedQuery = useDebounced(query, 350);
	const trimmedQuery = debouncedQuery.trim();
	const showSuggestions = trimmedQuery.length > 0;

	const desktopContainerRef = useRef<HTMLDivElement>(null);
	const desktopInputRef = useRef<HTMLInputElement>(null);
	const mobileInputRef = useRef<HTMLInputElement>(null);

	// Đóng ô tìm kiếm desktop (thu về icon) khi click ra ngoài, hoặc nhấn Esc.
	useEffect(() => {
		if (!desktopOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (desktopContainerRef.current && !desktopContainerRef.current.contains(event.target as Node)) setDesktopOpen(false);
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setDesktopOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [desktopOpen]);

	// Tự focus vào ô input ngay khi mở rộng ô tìm kiếm desktop hoặc overlay mobile.
	useEffect(() => {
		if (desktopOpen) desktopInputRef.current?.focus();
	}, [desktopOpen]);
	useEffect(() => {
		if (mobileOpen) mobileInputRef.current?.focus();
	}, [mobileOpen]);

	const closeAll = () => {
		setDesktopOpen(false);
		setMobileOpen(false);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = query.trim();
		if (!value) return;
		closeAll();
		navigate(`${paths.client.shop}?search=${encodeURIComponent(value)}`);
	};

	// Danh mục dùng cho phần "Duyệt theo danh mục" trong overlay mobile — chỉ fetch khi overlay mở.
	const { data: mobileCategories, isLoading: isMobileCategoriesLoading } = useCategoryTreeQuery();
	const navigateToMobileCategory = (categoryId: number) => {
		closeAll();
		navigate(`${paths.client.shop}?categoryId=${categoryId}`);
	};

	return (
		<>
			{/* Desktop: mặc định chỉ hiện icon kính lúp (không chiếm chỗ của nav); bấm vào mới bung ra ô
			    tìm kiếm dạng nổi (absolute) đè lên phía trên, không đẩy layout xung quanh. */}
			<div ref={desktopContainerRef} className='relative hidden shrink-0 lg:block'>
				{!desktopOpen && (
					<Button type='button' variant='ghost' onClick={() => setDesktopOpen(true)} aria-label='Tìm kiếm' className='size-10! rounded-full p-0!' icon={<SearchIcon className='h-5 w-5' />} />
				)}

				{desktopOpen && (
					<div className='absolute right-0 top-1/2 z-40 w-80 -translate-y-1/2 sm:w-96'>
						<form onSubmit={handleSubmit}>
							<div className='relative'>
								<SearchIcon className='pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted' />
								<FormControl
									ref={desktopInputRef}
									type='text'
									variant='surface'
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder='Tìm sản phẩm, danh mục...'
									rightElement={
										<Button
											type='button'
											variant='ghost'
											onClick={() => setDesktopOpen(false)}
											aria-label='Đóng tìm kiếm'
											className='size-7! rounded-full p-0!'
											icon={<CloseIcon className='h-4 w-4' />}
										/>
									}
									className='rounded-full! h-10! pl-10! shadow-lg shadow-ink/5'
								/>
							</div>
						</form>

						{showSuggestions && (
							<div className='absolute right-0 top-[calc(100%+8px)] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-ink/5'>
								<SearchSuggestions query={trimmedQuery} onNavigate={closeAll} />
							</div>
						)}
					</div>
				)}
			</div>

			{/* Mobile: thu gọn thành icon, bấm vào mở overlay tìm kiếm toàn màn hình */}
			<Button
				type='button'
				variant='outline'
				onClick={() => setMobileOpen(true)}
				aria-label='Tìm kiếm'
				className='size-10! shrink-0 rounded-full p-0! lg:hidden'
				icon={<SearchIcon className='h-5 w-5' />}
			/>

			<Overlay open={mobileOpen} onClose={closeAll} />
			<div
				className={`fixed inset-x-0 top-0 z-50! flex max-h-[85vh] transform flex-col overflow-hidden bg-surface transition-transform duration-300 ease-out lg:hidden ${
					mobileOpen ? "translate-y-0" : "-translate-y-full"
				}`}>
				<form onSubmit={handleSubmit} className='flex items-center gap-2 border-b border-border p-4'>
					<div className='relative flex-1'>
						<SearchIcon className='pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted' />
						<FormControl
							ref={mobileInputRef}
							type='search'
							variant='cream'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Tìm sản phẩm, danh mục...'
							className='rounded-full! h-11! pl-10!'
						/>
					</div>
				</form>

				<div className='overflow-y-auto'>
					{showSuggestions ? (
						<SearchSuggestions query={trimmedQuery} onNavigate={closeAll} />
					) : (
						<div className='p-4'>
							<p className='px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted'>Duyệt theo danh mục</p>
							{isMobileCategoriesLoading ? (
								<CategoryTreeMenuSkeleton />
							) : mobileCategories && mobileCategories.length > 0 ? (
								<CategoryTreeMenu categories={mobileCategories} onSelect={navigateToMobileCategory} />
							) : (
								<p className='px-1 py-4 text-center text-sm text-muted'>Chưa có danh mục nào.</p>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Search;
