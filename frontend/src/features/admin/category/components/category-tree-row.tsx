import { useState, Fragment } from "react";
import { ChevronRightIcon, PencilIcon, PlusIcon, TrashIcon } from "../../../../components/icons";
import type { CategoryTreeNode } from "../types";

interface CategoryTreeRowProps {
	node: CategoryTreeNode;
	depth: number;
	/** false khi user chỉ có "catalog:read" — ẩn hết nút thêm/sửa/xóa, chỉ xem. */
	canWrite: boolean;
	onAddChild: (parentId: number) => void;
	onEdit: (node: CategoryTreeNode) => void;
	onDelete: (node: CategoryTreeNode) => void;
}

/** 1 dòng trong bảng cây danh mục, tự đệ quy render các danh mục con khi mở rộng. */
const CategoryTreeRow = ({ node, depth, canWrite, onAddChild, onEdit, onDelete }: CategoryTreeRowProps) => {
	const [expanded, setExpanded] = useState(true);
	const hasChildren = node.subcategories.length > 0;
	// Khớp đúng điều kiện chặn xóa ở backend (category.service.ts:deleteCategory) — vô hiệu hóa
	// trước ở FE để tránh người dùng bấm xóa rồi mới nhận lỗi 409.
	const canDelete = node._count.subcategories === 0 && node._count.products === 0;

	return (
		<Fragment>
			<tr className='border-b border-border last:border-0 hover:bg-cream-soft/60'>
				<td className='px-5 py-3'>
					<div className='flex items-center gap-1.5' style={{ paddingLeft: depth * 24 }}>
						{hasChildren ? (
							<button
								type='button'
								onClick={() => setExpanded((prev) => !prev)}
								className='flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted transition-transform hover:text-ink'
								style={{ transform: expanded ? "rotate(90deg)" : "none" }}
								title={expanded ? "Thu gọn" : "Mở rộng"}>
								<ChevronRightIcon className='h-4 w-4' />
							</button>
						) : (
							<span className='h-5 w-5 shrink-0' />
						)}
						<div className='min-w-0'>
							<p className='truncate font-semibold text-ink'>{node.name}</p>
							<p className='truncate text-xs text-muted'>/{node.slug}</p>
						</div>
					</div>
				</td>
				<td className='px-5 py-3 text-ink/70'>{node._count.subcategories}</td>
				<td className='px-5 py-3 text-ink/70'>{node._count.products}</td>
				<td className='px-5 py-3'>
					{canWrite && (
						<div className='flex items-center justify-end gap-1.5'>
							<button
								type='button'
								onClick={() => onAddChild(node.id)}
								className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream-soft hover:text-ink'
								title='Thêm danh mục con'>
								<PlusIcon className='h-4 w-4' />
							</button>
							<button
								type='button'
								onClick={() => onEdit(node)}
								className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream-soft hover:text-ink'
								title='Sửa'>
								<PencilIcon className='h-4 w-4' />
							</button>
							<button
								type='button'
								disabled={!canDelete}
								onClick={() => onDelete(node)}
								className='flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted cursor-pointer'
								title={canDelete ? "Xóa" : "Không thể xóa: vẫn còn danh mục con hoặc sản phẩm thuộc danh mục này"}>
								<TrashIcon className='h-4 w-4' />
							</button>
						</div>
					)}
				</td>
			</tr>
			{expanded &&
				node.subcategories.map((child) => (
					<CategoryTreeRow
						key={child.id}
						node={child}
						depth={depth + 1}
						canWrite={canWrite}
						onAddChild={onAddChild}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				))}
		</Fragment>
	);
};

export default CategoryTreeRow;
