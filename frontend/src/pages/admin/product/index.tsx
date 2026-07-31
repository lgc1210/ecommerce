import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTitle from "../../../components/admin-title";
import Button from "../../../components/button";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Popup from "../../../components/popup";
import Pagination from "../../../components/pagination";
import { BoxIcon, CloseIcon, PlusIcon, SearchIcon, TrashIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseBooleanParam, parseNumberParam, parseEnumParam } from "../../../utils/searchParams";
import { formatCurrency } from "../../../utils/currency";
import paths from "../../../configs/constants/paths";
import { useCategoryTreeQuery } from "../../../features/admin/category/hooks";
import { flattenCategoryTree } from "../../../features/admin/category/utils";
import { useCreateProduct, useDeleteProduct, useProductsQuery } from "../../../features/admin/product/hooks";
import type {
	AdminProductListItem,
	CreateProductPayload,
	UpdateProductPayload,
} from "../../../features/admin/product/types";
import { getPriceRange, getTotalStock } from "../../../features/admin/product/utils";
import StatusBadge from "../../../features/admin/product/components/status-badge";
import ProductFormModal from "../../../features/admin/product/components/product-form-modal";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend, dẫn tới các trang
// "ảo" vượt quá dữ liệu thật (bấm vào sẽ trả về rỗng dù còn sản phẩm).
const PAGE_SIZE = 10;

/**
 * Trang danh sách sản phẩm. Route "/admin/product" yêu cầu "catalog:read"
 * (khớp GET /products/admin ở backend). Bấm vào 1 dòng -> sang trang chi tiết
 * ("/admin/product/:id") để quản lý biến thể (SKU) + ảnh — 2 phần đó không thể
 * quản lý gọn trong modal vì SKU cần tồn tại trước khi thêm được ảnh.
 */
const AdminProductPage = () => {
	const navigate = useNavigate();

	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } =
		useListQueryParams({ defaultLimit: PAGE_SIZE });

	const categoryId = parseNumberParam(searchParams, "categoryId");
	const isActive = parseBooleanParam(searchParams, "isActive");
	const sort = parseEnumParam<"newest" | "name_asc" | "name_desc">(searchParams, "sort");

	const { data, isLoading, isFetching } = useProductsQuery({ page, limit, search, categoryId, isActive, sort });
	const { data: categoryTree = [] } = useCategoryTreeQuery();
	const categoryOptions = flattenCategoryTree(categoryTree);

	const createProduct = useCreateProduct();
	const deleteProduct = useDeleteProduct();

	const [isCreating, setIsCreating] = useState(false);
	const [deletingProduct, setDeletingProduct] = useState<AdminProductListItem | null>(null);

	const products = data?.data ?? [];
	const pagination = data?.pagination;

	const handleCreate = (payload: CreateProductPayload | UpdateProductPayload) => {
		createProduct.mutate(payload as CreateProductPayload, {
			onSuccess: (res) => {
				setIsCreating(false);
				navigate(paths.admin.productDetail(res.data.data.id));
			},
		});
	};

	const handleConfirmDelete = () => {
		if (!deletingProduct) return;
		deleteProduct.mutate(deletingProduct.id, { onSuccess: () => setDeletingProduct(null) });
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Sản phẩm' description='Quản lý sản phẩm, biến thể và tồn kho.' />
				<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={() => setIsCreating(true)}>
					Thêm sản phẩm
				</Button>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo tên sản phẩm...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={searchParams.get("categoryId") ?? ""}
					onChange={(e) => setFilter("categoryId", e.target.value || undefined)}
					placeholder='Tất cả danh mục'
					options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
				/>
				<FormSelect
					value={searchParams.get("isActive") ?? ""}
					onChange={(e) => setFilter("isActive", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={[
						{ value: "true", label: "Đang bán" },
						{ value: "false", label: "Ngừng bán" },
					]}
				/>
				<FormSelect
					value={sort ?? ""}
					onChange={(e) => setFilter("sort", e.target.value || undefined)}
					placeholder='Mới nhất'
					options={[
						{ value: "name_asc", label: "Tên A → Z" },
						{ value: "name_desc", label: "Tên Z → A" },
					]}
				/>
				{hasActiveFilters(["categoryId", "isActive", "sort"]) && (
					<button
						type='button'
						onClick={clearFilters}
						className='flex h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:text-ink cursor-pointer'>
						<CloseIcon className='h-4 w-4' />
						Xóa bộ lọc
					</button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-220 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Sản phẩm</th>
							<th className='px-5 py-3.5'>Danh mục</th>
							<th className='px-5 py-3.5'>Giá</th>
							<th className='px-5 py-3.5'>Tồn kho</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5' />
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : products.length === 0 ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy sản phẩm nào.
								</td>
							</tr>
						) : (
							products.map((product) => {
								const priceRange = getPriceRange(product.skus);
								return (
									<tr
										key={product.id}
										onClick={() => navigate(paths.admin.productDetail(product.id))}
										className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'>
										<td className='px-5 py-3.5'>
											<div className='flex items-center gap-3'>
												<div className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-soft'>
													{product.thumbnailUrl ? (
														<img src={product.thumbnailUrl} alt={product.name} className='h-full w-full object-cover' />
													) : (
														<BoxIcon className='h-5 w-5 text-muted' />
													)}
												</div>
												<div className='min-w-0'>
													<p className='truncate font-semibold text-ink'>{product.name}</p>
													<p className='truncate text-xs text-muted'>{product.skus.length} biến thể</p>
												</div>
											</div>
										</td>
										<td className='px-5 py-3.5 text-ink/70'>{product.category?.name ?? "—"}</td>
										<td className='px-5 py-3.5 text-ink/80'>
											{priceRange
												? priceRange.min === priceRange.max
													? formatCurrency(priceRange.min)
													: `${formatCurrency(priceRange.min)} — ${formatCurrency(priceRange.max)}`
												: "—"}
										</td>
										<td className='px-5 py-3.5 text-ink/70'>{getTotalStock(product.skus)}</td>
										<td className='px-5 py-3.5'>
											<StatusBadge isActive={product.isActive} />
										</td>
										<td className='px-5 py-3.5' onClick={(e) => e.stopPropagation()}>
											<button
												type='button'
												onClick={() => setDeletingProduct(product)}
												className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600'
												title='Xóa'>
												<TrashIcon className='h-4 w-4' />
											</button>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{isCreating && (
				<ProductFormModal
					onClose={() => setIsCreating(false)}
					onSubmit={handleCreate}
					isSubmitting={createProduct.isPending}
				/>
			)}

			{deletingProduct && (
				<Popup
					title='Xóa sản phẩm'
					description={`Bạn có chắc muốn xóa sản phẩm "${deletingProduct.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa sản phẩm'
					isConfirming={deleteProduct.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingProduct(null)}
				/>
			)}
		</div>
	);
};

export default AdminProductPage;
