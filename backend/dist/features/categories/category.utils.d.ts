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
export declare function buildCategoryTree(categories: Array<Record<string, any>>): CategoryTreeNode[];
//# sourceMappingURL=category.utils.d.ts.map