export interface CategoryTreeNode {
	id: number;
	parentId: number | null;
	name: string;
	slug: string;
	description: string | null;
	subcategories: CategoryTreeNode[];
	[key: string]: unknown;
}

/** Dựng cây danh mục từ danh sách phẳng (flat list), gắn con vào đúng parentId */
export function buildCategoryTree(categories: Array<Record<string, any>>): CategoryTreeNode[] {
	const nodeById = new Map<number, CategoryTreeNode>();
	const roots: CategoryTreeNode[] = [];

	for (const category of categories) {
		nodeById.set(category.id, { ...category, subcategories: [] } as unknown as CategoryTreeNode);
	}

	for (const category of categories) {
		const node = nodeById.get(category.id)!;
		if (category.parentId !== null && category.parentId !== undefined && nodeById.has(category.parentId)) {
			nodeById.get(category.parentId)!.subcategories.push(node);
		} else {
			roots.push(node);
		}
	}

	console.log("roots: ", JSON.stringify(roots));

	return roots;
}
