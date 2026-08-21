import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "../../../../../components/icons";
import paths from "../../../../../configs/constants/paths";
import Button from "../../../../../components/button";
import { useCategoryTreeQuery } from "../../../category/hooks";
import type { PublicCategoryTreeNode } from "../../../product/types";

interface CategoryTreeMenuProps {
	categories: PublicCategoryTreeNode[];
	onSelect: (categoryId: number) => void;
}

/** Danh sách danh mục dạng cây (có thể mở/thu gọn danh mục con) dùng để điều hướng nhanh sang
 *  trang Cửa hàng đã lọc sẵn theo danh mục — tái sử dụng ở dropdown desktop và overlay tìm kiếm mobile. */
export const CategoryTreeMenu = ({ categories, onSelect }: CategoryTreeMenuProps) => (
	<ul className='space-y-0.5'>
		{categories.map((node) => (
			<CategoryTreeMenuNode key={node.id} node={node} depth={0} onSelect={onSelect} />
		))}
	</ul>
);

interface CategoryTreeMenuNodeProps {
	node: PublicCategoryTreeNode;
	depth: number;
	onSelect: (categoryId: number) => void;
}

const CategoryTreeMenuNode = ({ node, depth, onSelect }: CategoryTreeMenuNodeProps) => {
	const hasChildren = node.subcategories.length > 0;
	const [expanded, setExpanded] = useState(false);

	return (
		<li>
			<div className='flex items-center gap-1' style={{ paddingLeft: depth * 14 }}>
				<button
					type='button'
					onClick={() => onSelect(node.id)}
					className='flex flex-1 items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-cream-soft hover:not-disabled:cursor-default'>
					<span className='truncate'>{node.name}</span>
					<span className='shrink-0 text-xs text-muted'>{node._count.products}</span>
				</button>

				{hasChildren && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={() => setExpanded((prev) => !prev)}
						aria-expanded={expanded}
						aria-label={expanded ? `Thu gọn ${node.name}` : `Mở rộng ${node.name}`}
						className='size-7! shrink-0 rounded-lg p-0!'>
						<ChevronRightIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
					</Button>
				)}
			</div>

			{hasChildren && expanded && (
				<ul>
					{node.subcategories.map((child) => (
						<CategoryTreeMenuNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
					))}
				</ul>
			)}
		</li>
	);
};

/** Skeleton dùng chung khi cây danh mục đang tải, ở cả dropdown desktop lẫn overlay mobile. */
export const CategoryTreeMenuSkeleton = () => (
	<div className='space-y-2 p-1'>
		{Array.from({ length: 5 }).map((_, i) => (
			<div key={i} className='h-8 animate-pulse rounded-lg bg-cream-soft' />
		))}
	</div>
);

/**
 * Nút "Danh mục" trên header (chỉ hiển thị ở desktop, lg+) — bấm vào mở dropdown liệt kê toàn bộ
 * cây danh mục, cho phép nhảy thẳng tới trang Cửa hàng đã lọc theo danh mục mà không cần gõ tìm
 * kiếm. Trên mobile, danh mục được gộp vào overlay tìm kiếm (xem <Search />) thay vì có nút riêng.
 */
const CategoryFilter = () => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data: categories, isLoading } = useCategoryTreeQuery();

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	const goToCategory = (categoryId: number) => {
		setOpen(false);
		navigate(`${paths.client.shop}?categoryId=${categoryId}`);
	};

	return (
		<div ref={containerRef} className='relative hidden shrink-0 lg:block'>
			<button
				type='button'
				onClick={() => setOpen((prev) => !prev)}
				aria-haspopup='menu'
				aria-expanded={open}
				className={`flex items-center gap-1 text-sm font-semibold transition-colors cursor-default! ${open ? "text-primary-dark" : "text-ink/80 hover:text-primary-dark"}`}>
				Danh mục
				<ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
			</button>

			{open && (
				<div className='absolute left-0 top-[calc(100%+12px)] z-40 max-h-96 w-72 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg shadow-ink/5'>
					{isLoading ? (
						<CategoryTreeMenuSkeleton />
					) : categories && categories.length > 0 ? (
						<CategoryTreeMenu categories={categories} onSelect={goToCategory} />
					) : (
						<p className='px-3 py-4 text-center text-sm text-muted'>Chưa có danh mục nào.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default CategoryFilter;
