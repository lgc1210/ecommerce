/** Dựng cây danh mục từ danh sách phẳng (flat list), gắn con vào đúng parentId */
export function buildCategoryTree(categories) {
    const nodeById = new Map();
    const roots = [];
    for (const category of categories) {
        nodeById.set(category.id, { ...category, subcategories: [] });
    }
    for (const category of categories) {
        const node = nodeById.get(category.id);
        if (category.parentId !== null && category.parentId !== undefined && nodeById.has(category.parentId)) {
            nodeById.get(category.parentId).subcategories.push(node);
        }
        else {
            roots.push(node);
        }
    }
    return roots;
}
//# sourceMappingURL=category.utils.js.map