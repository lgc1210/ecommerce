import type { CategoryTreeNode } from "../types";

export interface FlatCategoryOption {
	id: number;
	/** Tên có tiền tố "— " lặp lại theo độ sâu, để thể hiện phân cấp trong <select> phẳng. */
	label: string;
	depth: number;
}

/** Làm phẳng cây danh mục thành danh sách có thứ tự cha-trước-con-sau, kèm độ sâu — dùng cho dropdown chọn danh mục cha. */
export function flattenCategoryTree(nodes: CategoryTreeNode[], depth = 0): FlatCategoryOption[] {
	return nodes.flatMap((node) => [
		{ id: node.id, label: `${"—\u00A0".repeat(depth)}${node.name}`, depth },
		...flattenCategoryTree(node.subcategories, depth + 1),
	]);
}

/** Tập hợp id của chính node và mọi hậu duệ (con/cháu...) — dùng để loại khỏi option "danh mục cha" khi sửa, tránh chọn con của chính nó làm cha (tạo vòng lặp). */
export function collectSubtreeIds(node: CategoryTreeNode): Set<number> {
	const ids = new Set<number>([node.id]);
	for (const child of node.subcategories) {
		for (const id of collectSubtreeIds(child)) ids.add(id);
	}
	console.log("ids: ", ids);
	return ids;
}
