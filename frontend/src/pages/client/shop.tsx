import BreadCrumb from "../../components/breadcrumb";
import Pagination from "../../components/pagination";
import { formatCurrency } from "../../utils/currency";
import { parseNumberParam, parseEnumParam } from "../../utils/searchParams";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "../../components/icons";
import useListQueryParams from "../../hooks/useListQueryParams";
import { useState } from "react";
import { useCategoryTreeQuery, useProductsQuery } from "../../features/client/product/hooks";
import { toProductCardItem } from "../../features/client/product/utils";
import type { ListProductsParams } from "../../features/client/product/types";
import ProductCard from "../../features/client/product/components/product-card";
import CategoryFilterTree from "../../features/client/product/components/category-filter-tree";

const PAGE_SIZE = 12;
const MAX_PRICE = 5000000;

// Chỉ 3 giá trị này được backend hỗ trợ (xem ListProductsQuerySchema ở product.validation.ts) —
// không có sort theo giá/đánh giá vì giá sống ở từng SKU, không phải ở Product.
const sortOptions: { value: NonNullable<ListProductsParams["sort"]>; label: string }[] = [
	{ value: "newest", label: "Mới nhất" },
	{ value: "name_asc", label: "Tên: A đến Z" },
	{ value: "name_desc", label: "Tên: Z đến A" },
];

const ShopPage = () => {
	const [filtersOpen, setFiltersOpen] = useState(false);

	// Gom logic page/limit/search + filter riêng qua URL params, dùng chung với domain admin
	// (xem useListQueryParams) thay vì tự quản searchParams thủ công.
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } =
		useListQueryParams({ defaultLimit: PAGE_SIZE });

	const categoryId = parseNumberParam(searchParams, "categoryId");
	const maxPrice = parseNumberParam(searchParams, "maxPrice") ?? MAX_PRICE;
	const sort = parseEnumParam<NonNullable<ListProductsParams["sort"]>>(searchParams, "sort") ?? "newest";

	const { data: categoryTree } = useCategoryTreeQuery();
	const categories = categoryTree ?? [];

	const { data, isLoading, isFetching } = useProductsQuery({
		page,
		limit,
		search: search || undefined,
		categoryId,
		maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
		sort,
	});

	const products = data?.data ?? [];
	const pagination = data?.pagination;

	const toggleCategory = (id: number) => {
		setFilter("categoryId", categoryId === id ? undefined : String(id));
	};

	const FilterPanel = (
		<div className='space-y-8'>
			<div>
				<h3 className='font-bold text-ink'>Tìm kiếm</h3>
				<div className='mt-4 flex items-center gap-2'>
					<input
						type='text'
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder='Tên sản phẩm...'
						className='w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-primary'
					/>
					<span
						aria-hidden='true'
						className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white'>
						<SearchIcon className='h-4 w-4' />
					</span>
				</div>
			</div>

			<div>
				<h3 className='font-bold text-ink'>Danh mục</h3>
				<div className='mt-4'>
					<CategoryFilterTree
						categories={categories}
						selectedCategoryId={categoryId}
						onToggleCategory={toggleCategory}
					/>
				</div>
			</div>

			<div>
				<h3 className='font-bold text-ink'>Khoảng giá</h3>
				<input
					type='range'
					min={100000}
					max={MAX_PRICE}
					step={50000}
					value={maxPrice}
					onChange={(e) => setFilter("maxPrice", e.target.value)}
					className='mt-4 w-full accent-primary'
				/>
				<div className='mt-2 flex justify-between text-xs text-muted'>
					<span>0₫</span>
					<span className='font-semibold text-ink'>{formatCurrency(maxPrice)}</span>
				</div>
			</div>

			{hasActiveFilters(["categoryId", "maxPrice", "sort"]) && (
				<button
					type='button'
					onClick={clearFilters}
					className='w-full rounded-full border border-border py-2.5 text-sm font-semibold text-ink hover:border-primary hover:text-primary-dark'>
					Xoá bộ lọc
				</button>
			)}
		</div>
	);

	return (
		<div>
			<BreadCrumb title='Cửa hàng' description='Khám phá toàn bộ sản phẩm của cửa hàng.' />

			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				<div className='grid gap-10 lg:grid-cols-[240px_1fr]'>
					{/* Desktop filters */}
					<aside className='hidden lg:block'>{FilterPanel}</aside>

					<div>
						{/* Toolbar */}
						<div className='flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4'>
							<button
								type='button'
								onClick={() => setFiltersOpen(true)}
								className='flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink lg:hidden'>
								<FilterIcon className='h-4 w-4' />
								Bộ lọc
							</button>
							<p className='text-sm text-muted'>
								{isLoading ? (
									"Đang tải..."
								) : (
									<>
										Hiển thị <span className='font-semibold text-ink'>{products.length}</span> /{" "}
										{pagination?.total ?? 0} sản phẩm
									</>
								)}
							</p>
							<div className='relative'>
								<select
									value={sort}
									onChange={(e) => setFilter("sort", e.target.value)}
									className='appearance-none rounded-full border border-border bg-surface py-2 pl-4 pr-9 text-sm font-medium text-ink outline-none focus:border-primary'>
									{sortOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<ChevronDownIcon className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
							</div>
						</div>

						{isLoading ? (
							<div className='mt-16 text-center text-muted'>Đang tải sản phẩm...</div>
						) : products.length > 0 ? (
							<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3'>
								{products.map((product) => (
									<ProductCard key={product.slug} product={toProductCardItem(product)} />
								))}
							</div>
						) : (
							<div className='mt-16 text-center text-muted'>Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</div>
						)}

						<div className='mt-10'>
							<Pagination
								total={pagination?.total ?? 0}
								defaultLimit={PAGE_SIZE}
								pageSizeOptions={[]}
								isLoading={isFetching}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile filter drawer */}
			<div
				onClick={() => setFiltersOpen(false)}
				className={`fixed inset-0 z-40 bg-ink/50 transition-opacity lg:hidden ${
					filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			/>
			<div
				className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-surface p-6 transition-transform duration-200 lg:hidden ${
					filtersOpen ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className='mb-6 flex items-center justify-between'>
					<h2 className='text-lg font-bold text-ink'>Bộ lọc</h2>
					<button
						type='button'
						onClick={() => setFiltersOpen(false)}
						className='text-sm font-semibold text-primary-dark'>
						Đóng
					</button>
				</div>
				{FilterPanel}
			</div>
		</div>
	);
};

export default ShopPage;
