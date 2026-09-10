import type { CreateCategoryInput, ListCategoriesParams, UpdateCategoryInput } from "./category.validation.js";
declare class CategoryService {
    listCategories(params: ListCategoriesParams): Promise<{
        data: import("./category.utils.js").CategoryTreeNode[];
        pagination?: never;
    } | {
        data: ({
            _count: {
                subcategories: number;
                products: number;
            };
        } & {
            id: number;
            createdAt: Date | null;
            name: string;
            slug: string;
            description: string | null;
            isFeatured: boolean;
            parentId: number | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCategoryBySlug(slug: string): Promise<{
        _count: {
            products: number;
        };
        subcategories: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
        }[];
        parent: {
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        isFeatured: boolean;
        parentId: number | null;
    }>;
    /** Lấy danh sách danh mục nổi bật (is_featured = true), dùng cho trang chủ / client */
    getFeaturedCategories(limit?: number): Promise<{
        data: ({
            _count: {
                subcategories: number;
                products: number;
            };
        } & {
            id: number;
            createdAt: Date | null;
            name: string;
            slug: string;
            description: string | null;
            isFeatured: boolean;
            parentId: number | null;
        })[];
    }>;
    getCategoryById(id: number): Promise<{
        _count: {
            subcategories: number;
            products: number;
        };
        parent: {
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        id: number;
        createdAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        isFeatured: boolean;
        parentId: number | null;
    }>;
    createCategory(data: CreateCategoryInput): Promise<{
        id: number;
        createdAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        isFeatured: boolean;
        parentId: number | null;
    }>;
    updateCategory(id: number, data: UpdateCategoryInput): Promise<{
        id: number;
        createdAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        isFeatured: boolean;
        parentId: number | null;
    }>;
    deleteCategory(id: number): Promise<void>;
    private assertParentExists;
    /** Kiểm tra xem `candidateId` có phải là hậu duệ (con/cháu...) của `ancestorId` hay không, để chặn vòng lặp phân cấp */
    private isDescendantOf;
    /** Sinh slug duy nhất từ tên/slug đề xuất, tự thêm hậu tố -2, -3... nếu bị trùng */
    private resolveUniqueSlug;
}
declare const _default: CategoryService;
export default _default;
//# sourceMappingURL=category.service.d.ts.map