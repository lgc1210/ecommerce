import { useState } from "react";
import AdminTitle from "../../../components/admin-title";
import Button from "../../../components/button";
import Can from "../../../components/can";
import FormControl from "../../../components/form-control";
import Popup from "../../../components/popup";
import { CloseIcon, PlusIcon, SearchIcon } from "../../../components/icons";
import permissions from "../../../configs/constants/permissions";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import {
	useCategoryTreeQuery,
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "../../../features/admin/category/hooks";
import type {
	Category,
	CategoryTreeNode,
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from "../../../features/admin/category/types";
import { collectSubtreeIds, flattenCategoryTree } from "../../../features/admin/category/utils";
import CategoryTreeRow from "../../../features/admin/category/components/category-tree-row";
import CategoryFormModal from "../../../features/admin/category/components/category-form-modal";

type FormState =
	| { mode: "create"; parentId: number | null }
	| { mode: "edit"; category: Category; ownSubtreeIds: Set<number> };

/**
 * Trang quản trị Category. Route "/admin/category" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.catalog.read) (xem configs/routes/index.ts),
 * khớp với backend: GET /categories?tree=true yêu cầu đăng nhập + "catalog:read"
 * (khi gọi qua route "/id/:id" hoặc list — ở đây trang dùng list tree nên chỉ cần
 * đứng sau login, nhưng để nhất quán route vẫn khóa theo permission catalog.read).
 *
 * Danh mục vốn là cây phân cấp (parentId) nên hiển thị dạng cây thay vì bảng phân
 * trang phẳng — khớp đúng với chế độ `tree=true` mà backend hỗ trợ riêng cho
 * trường hợp này (bỏ qua phân trang, trả về toàn bộ cây đã lồng cấp con).
 */
const AdminCategoryPage = () => {
	const { can } = useAuth();
	const canWrite = can(permissions.catalog.write);

	const { search, searchInput, setSearchInput, clearFilters } = useListQueryParams();

	const { data: tree = [], isLoading, isFetching } = useCategoryTreeQuery(search);
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();

	const [formState, setFormState] = useState<FormState | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<CategoryTreeNode | null>(null);

	// Danh sách phẳng đầy đủ, dùng cho dropdown "Danh mục cha". Khi đang sửa, loại bỏ
	// chính node đó + toàn bộ hậu duệ của nó để không thể tự chọn con của mình làm cha
	// (backend cũng chặn trường hợp này, đây chỉ là UX ẩn bớt lựa chọn vô nghĩa).
	const parentOptions =
		formState?.mode === "edit"
			? flattenCategoryTree(tree).filter((option) => !formState.ownSubtreeIds.has(option.id))
			: flattenCategoryTree(tree);

	const handleSubmitForm = (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
		if (formState?.mode === "edit") {
			updateCategory.mutate(payload as UpdateCategoryPayload, { onSuccess: () => setFormState(null) });
		} else {
			createCategory.mutate(payload as CreateCategoryPayload, { onSuccess: () => setFormState(null) });
		}
	};

	const handleConfirmDelete = () => {
		if (!deletingCategory) return;
		deleteCategory.mutate(deletingCategory.id, { onSuccess: () => setDeletingCategory(null) });
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Danh mục' description='Quản lý hệ thống danh mục sản phẩm phân cấp cha - con.' />

				<Can permission={permissions.catalog.write}>
					<Button
						size='sm'
						icon={<PlusIcon className='h-4 w-4' />}
						onClick={() => setFormState({ mode: "create", parentId: null })}>
						Thêm danh mục
					</Button>
				</Can>
			</div>

			{/* Filter */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo tên danh mục...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				{search && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={clearFilters}
						icon={<CloseIcon className='h-4 w-4' />}
						iconPosition='left'
						className='gap-1.5! bg-transparent! px-0! my-auto text-muted! hover:text-ink!'>
						Xoá bộ lọc
					</Button>
				)}
			</div>

			{/* Tree table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-160 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Danh mục</th>
							<th className='px-5 py-3.5'>Danh mục con</th>
							<th className='px-5 py-3.5'>Sản phẩm</th>
							<th className='px-5 py-3.5' />
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={4} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : tree.length === 0 ? (
							<tr>
								<td colSpan={4} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy danh mục nào.
								</td>
							</tr>
						) : (
							tree.map((node) => (
								<CategoryTreeRow
									key={node.id}
									node={node}
									depth={0}
									canWrite={canWrite}
									onAddChild={(parentId) => setFormState({ mode: "create", parentId })}
									onEdit={(category) =>
										setFormState({ mode: "edit", category, ownSubtreeIds: collectSubtreeIds(category) })
									}
									onDelete={setDeletingCategory}
								/>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			{formState && (
				<CategoryFormModal
					category={formState.mode === "edit" ? formState.category : undefined}
					initialParentId={formState.mode === "create" ? formState.parentId : undefined}
					parentOptions={parentOptions}
					onClose={() => setFormState(null)}
					onSubmit={handleSubmitForm}
					isSubmitting={createCategory.isPending || updateCategory.isPending}
				/>
			)}

			{deletingCategory && (
				<Popup
					title='Xóa danh mục'
					description={`Bạn có chắc muốn xóa danh mục "${deletingCategory.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa danh mục'
					isConfirming={deleteCategory.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingCategory(null)}
				/>
			)}
		</div>
	);
};

export default AdminCategoryPage;
