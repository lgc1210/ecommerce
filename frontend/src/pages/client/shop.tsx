import BreadCrumb from "../../components/breadcrumb";
import Pagination from "../../components/pagination";
import { formatCurrency } from "../../utils/currency";
import { parseNumberParam, parseEnumParam } from "../../utils/searchParams";
import { FilterIcon } from "../../components/icons";
import useListQueryParams from "../../hooks/useListQueryParams";
import { useState } from "react";
import { useCategoryTreeQuery, useProductsQuery } from "../../features/client/product/hooks";
import { toProductCardItem } from "../../features/client/product/utils";
import type { ListProductsParams } from "../../features/client/product/types";
import ProductCard from "../../features/client/product/components/product-card";
import CategoryFilterTree from "../../features/client/product/components/category-filter-tree";
import FormControl from "../../components/form-control";
import Button from "../../components/button";
import FormSelect from "../../components/form-select";

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

	// Thanh kéo khoảng giá: bind trực tiếp vào state cục bộ để kéo mượt (không giật khi URL/API
	// chưa kịp cập nhật). Lưu ý: input[type=range] trong React bắn onChange trên MỖI bước kéo
	// (tương ứng sự kiện "input" của DOM), không phải chỉ lúc thả chuột — nên KHÔNG dùng debounce
	// theo thời gian ở đây: nếu người dùng kéo chậm hoặc dừng tay một nhịp giữa chừng (> khoảng thời
	// gian debounce) mà chưa thả chuột, bộ lọc vẫn bị áp dụng ngay tại vị trí đang kéo dở — đúng là lỗi
	// đang gặp. Thay vào đó, chỉ ghi vào URL param "maxPrice" (từ đó mới trigger gọi API) khi người
	// dùng THẢ TAY xong (mouseup/touchend) hoặc nhả phím (keyup, cho thao tác bằng bàn phím).
	const [rangeInput, setRangeInput] = useState(maxPrice);

	// Đồng bộ ngược lại khi "maxPrice" trên URL đổi từ nguồn khác (vd. bấm "Xoá bộ lọc"), để thanh
	// kéo không bị lệch với bộ lọc thực tế đang áp dụng. Điều chỉnh NGAY TRONG LÚC RENDER (so với
	// giá trị "maxPrice" lần render trước) thay vì qua useEffect — đây là cách React khuyến nghị cho
	// việc "đồng bộ state theo prop/param thay đổi" (xem https://react.dev/learn/you-might-not-need-an-effect),
	// tránh phải render 1 nhịp thừa rồi mới effect chạy lại set state (cascading render).
	const [prevMaxPrice, setPrevMaxPrice] = useState(maxPrice);
	if (maxPrice !== prevMaxPrice) {
		setPrevMaxPrice(maxPrice);
		setRangeInput(maxPrice);
	}

	// Chỉ áp dụng bộ lọc (ghi vào URL) khi thao tác kéo/nhấn phím đã kết thúc, không phụ thuộc thời gian.
	const commitRange = (value: number) => {
		if (value === maxPrice) return;
		setFilter("maxPrice", value < MAX_PRICE ? String(value) : undefined);
	};

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
		<div className='space-y-8 sticky top-30 z-20'>
			<div>
				<h3 className='font-bold text-ink'>Tìm kiếm</h3>
				<div className='mt-4'>
					<FormControl
						type='text'
						variant='surface'
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder='Tên sản phẩm...'
						className='rounded-full! h-10!'
					/>
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
				<FormControl
					type='range'
					max={MAX_PRICE}
					step={50000}
					value={rangeInput}
					onChange={(e) => setRangeInput(Number(e.target.value))}
					onMouseUp={(e) => commitRange(Number(e.currentTarget.value))}
					onTouchEnd={(e) => commitRange(Number(e.currentTarget.value))}
					onKeyUp={(e) => commitRange(Number(e.currentTarget.value))}
					className='px-0! accent-primary outline-none! ring-0! border-0! cursor-pointer'
				/>
				<div className='mt-2 flex justify-between text-xs text-muted'>
					<span>0₫</span>
					<span className='font-semibold text-ink'>{formatCurrency(rangeInput)}</span>
				</div>
			</div>

			{hasActiveFilters(["categoryId", "maxPrice", "sort"]) && (
				<Button type='button' variant='outline' onClick={clearFilters} className='w-full'>
					Xoá bộ lọc
				</Button>
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
							<Button type='button' onClick={() => setFiltersOpen(true)} icon={<FilterIcon className='h-4 w-4' />}>
								Bộ lọc
							</Button>
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
							<FormSelect value={sort} options={sortOptions} onChange={(e) => setFilter("sort", e.target.value)} />
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
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={() => setFiltersOpen(false)}
						className='bg-transparent! hover:text-primary-dark!'>
						Đóng
					</Button>
				</div>
				{FilterPanel}
			</div>
		</div>
	);
};

export default ShopPage;
