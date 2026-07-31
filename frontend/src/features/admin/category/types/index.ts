/** 1 danh mục ở dạng phẳng (flat), khớp với model Prisma Category + _count. */
export interface Category {
	id: number;
	parentId: number | null;
	name: string;
	slug: string;
	description: string | null;
	isFeatured: boolean;
	createdAt?: string;
	updatedAt?: string;
	_count: { subcategories: number; products: number };
}

/** Node cây danh mục — trả về khi gọi list với tree=true (xem buildCategoryTree ở backend). */
export interface CategoryTreeNode extends Category {
	subcategories: CategoryTreeNode[];
}

export interface CreateCategoryPayload {
	name: string;
	slug?: string;
	description?: string;
	parentId?: number | null;
	isFeatured?: boolean;
}

export interface UpdateCategoryPayload {
	id: number;
	name?: string;
	slug?: string;
	description?: string;
	parentId?: number | null;
	isFeatured?: boolean;
}
