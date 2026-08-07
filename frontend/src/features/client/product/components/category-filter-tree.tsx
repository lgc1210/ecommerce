import { useState } from "react";
import { ChevronDownIcon } from "../../../../components/icons";
import type { PublicCategoryTreeNode } from "../types";
import Button from "../../../../components/button";

interface CategoryFilterTreeProps {
	categories: PublicCategoryTreeNode[];
	selectedCategoryId?: number;
	onToggleCategory: (id: number) => void;
}

/** True nếu `node` chính là `id`, hoặc `id` nằm ở bất kỳ cấp con nào bên dưới `node`. */
const containsCategory = (node: PublicCategoryTreeNode, id: number): boolean => node.id === id || node.subcategories.some((child) => containsCategory(child, id));

/**
 * Bộ lọc danh mục dạng cây: danh mục gốc render trước, danh mục có cấp con hiển thị nút mở/thu
 * gọn (dropdown) để lộ ra danh mục con lồng bên trong thay vì render tất cả cùng 1 cấp phẳng.
 */
const CategoryFilterTree = ({ categories, selectedCategoryId, onToggleCategory }: CategoryFilterTreeProps) => (
	<ul className='space-y-1'>
		{categories.map((node) => (
			<CategoryFilterNode key={node.id} node={node} depth={0} selectedCategoryId={selectedCategoryId} onToggleCategory={onToggleCategory} />
		))}
	</ul>
);

interface CategoryFilterNodeProps {
	node: PublicCategoryTreeNode;
	depth: number;
	selectedCategoryId?: number;
	onToggleCategory: (id: number) => void;
}

const CategoryFilterNode = ({ node, depth, selectedCategoryId, onToggleCategory }: CategoryFilterNodeProps) => {
	const hasChildren = node.subcategories.length > 0;
	const containsSelected = selectedCategoryId !== undefined && containsCategory(node, selectedCategoryId);

	// Mặc định thu gọn, trừ khi danh mục đang được chọn nằm trong nhánh này -> tự mở ra để lộ ra lựa chọn hiện tại.
	const [expanded, setExpanded] = useState(containsSelected);

	// Khi selectedCategoryId đổi khiến containsSelected chuyển từ false -> true, cần tự mở node ra.
	// Cố tình KHÔNG dùng useEffect(() => { if (containsSelected) setExpanded(true) }, [containsSelected])
	// vì effect đó set state SAU khi đã render xong -> React 19 cảnh báo "cascading renders" (effect
	// chỉ nên đồng bộ với hệ thống bên ngoài, không phải để suy ra state từ state/props khác). Thay vào
	// đó điều chỉnh state ngay trong lúc render theo pattern chính thức của React:
	// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	const [prevContainsSelected, setPrevContainsSelected] = useState(containsSelected);
	if (containsSelected !== prevContainsSelected) {
		setPrevContainsSelected(containsSelected);
		if (containsSelected) setExpanded(true);
	}

	return (
		<li>
			<div className='flex items-center gap-1.5' style={{ paddingLeft: depth * 16 }}>
				{hasChildren ? (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={() => setExpanded((prev) => !prev)}
						aria-expanded={expanded}
						aria-label={expanded ? `Thu gọn ${node.name}` : `Mở rộng ${node.name}`}
						className='flex h-5 w-5 shrink-0 items-center justify-center bg-transparent! p-0!'>
						<ChevronDownIcon className={`h-3.5 w-3.5 transition-transform text-muted! hover:text-ink! ${expanded ? "" : "-rotate-90"}`} />
					</Button>
				) : (
					<span className='h-5 w-5 shrink-0' aria-hidden='true' />
				)}

				<label className='flex flex-1 cursor-default items-center gap-2.5 text-sm text-ink/80'>
					<input type='checkbox' checked={selectedCategoryId === node.id} onChange={() => onToggleCategory(node.id)} className='h-4 w-4 rounded border-border text-primary focus:ring-primary-light' />
					{node.name}
					<span className='ml-auto text-xs text-muted'>{node._count.products}</span>
				</label>
			</div>

			{hasChildren && expanded && (
				<ul className='mt-1 space-y-1'>
					{node.subcategories.map((child) => (
						<CategoryFilterNode key={child.id} node={child} depth={depth + 1} selectedCategoryId={selectedCategoryId} onToggleCategory={onToggleCategory} />
					))}
				</ul>
			)}
		</li>
	);
};

export default CategoryFilterTree;
