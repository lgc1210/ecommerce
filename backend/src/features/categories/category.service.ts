import prisma from "../../config/prisma.js";
import { buildCategoryTree } from "./category.utils.js";
import { parsePagination, slugify } from "../../utils/index.js";
import type { CreateCategoryInput, ListCategoriesParams, UpdateCategoryInput } from "./category.validation.js";

const categoryListInclude = {
	_count: { select: { subcategories: true, products: true } },
};

class CategoryService {
	// ==========================================
	// Public
	// ==========================================
	async listCategories(params: ListCategoriesParams) {
		const where: Record<string, unknown> = {};
		if (params.search) {
			where.name = { contains: params.search };
		}

		// Chế độ cây: trả về toàn bộ hệ thống phân cấp, bỏ qua phân trang vì tree cần đủ dữ liệu để lồng cấp con
		if (params.tree === "true") {
			const categories = await prisma.category.findMany({
				where,
				include: categoryListInclude,
				orderBy: { name: "asc" },
			});
			return { data: buildCategoryTree(categories) };
		}

		if (params.parentId === "null") {
			where.parentId = null;
		} else if (params.parentId) {
			where.parentId = Number(params.parentId);
		}

		const { page, limit, skip } = parsePagination(params);
		const [categories, total] = await Promise.all([
			prisma.category.findMany({
				where,
				include: categoryListInclude,
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			prisma.category.count({ where }),
		]);

		return {
			data: categories,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getCategoryBySlug(slug: string) {
		const category = await prisma.category.findUnique({
			where: { slug },
			include: {
				parent: { select: { id: true, name: true, slug: true } },
				subcategories: { select: { id: true, name: true, slug: true, description: true } },
				_count: { select: { products: true } },
			},
		});

		if (!category) {
			throw new Error("NotFound: Danh mục không tồn tại.");
		}

		return category;
	}

	/** Lấy danh sách danh mục nổi bật (is_featured = true), dùng cho trang chủ / client */
	async getFeaturedCategories(limit?: number) {
		const categories = await prisma.category.findMany({
			where: { isFeatured: true },
			include: categoryListInclude,
			orderBy: { name: "asc" },
			...(limit !== undefined ? { take: limit } : {}),
		});

		return { data: categories };
	}

	// ==========================================
	// Admin
	// ==========================================
	async getCategoryById(id: number) {
		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				parent: { select: { id: true, name: true, slug: true } },
				...categoryListInclude,
			},
		});

		if (!category) {
			throw new Error("NotFound: Danh mục không tồn tại.");
		}

		return category;
	}

	async createCategory(data: CreateCategoryInput) {
		if (data.parentId) {
			await this.assertParentExists(data.parentId);
		}

		const slug = await this.resolveUniqueSlug(data.slug ?? data.name);

		return prisma.category.create({
			data: {
				name: data.name,
				slug,
				description: data.description ?? null,
				parentId: data.parentId ?? null,
				isFeatured: data.isFeatured ?? false,
			},
		});
	}

	async updateCategory(id: number, data: UpdateCategoryInput) {
		const existing = await prisma.category.findUnique({ where: { id } });
		if (!existing) {
			throw new Error("NotFound: Danh mục không tồn tại.");
		}

		const updateData: Record<string, unknown> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

		if (data.slug !== undefined && data.slug !== existing.slug) {
			const slugOwner = await prisma.category.findUnique({ where: { slug: data.slug } });
			if (slugOwner) {
				throw new Error("Conflict: Slug này đã được sử dụng bởi danh mục khác.");
			}
			updateData.slug = data.slug;
		}

		if (data.parentId !== undefined) {
			if (data.parentId === id) {
				throw new Error("BadRequest: Danh mục không thể là danh mục cha của chính nó.");
			}
			if (data.parentId !== null) {
				await this.assertParentExists(data.parentId);
				const isDescendant = await this.isDescendantOf(data.parentId, id);
				if (isDescendant) {
					throw new Error("BadRequest: Không thể chọn danh mục con của chính nó làm danh mục cha (tạo vòng lặp phân cấp).");
				}
			}
			updateData.parentId = data.parentId;
		}

		return prisma.category.update({ where: { id }, data: updateData });
	}

	async deleteCategory(id: number) {
		const category = await prisma.category.findUnique({
			where: { id },
			include: { _count: { select: { subcategories: true, products: true } } },
		});

		if (!category) {
			throw new Error("NotFound: Danh mục không tồn tại.");
		}

		if (category._count.subcategories > 0) {
			throw new Error("Conflict: Không thể xóa danh mục vì vẫn còn danh mục con. Hãy xóa hoặc chuyển các danh mục con trước.");
		}

		if (category._count.products > 0) {
			throw new Error("Conflict: Không thể xóa danh mục vì vẫn còn sản phẩm thuộc danh mục này. Hãy chuyển sản phẩm sang danh mục khác trước.");
		}

		await prisma.category.delete({ where: { id } });
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async assertParentExists(parentId: number) {
		const parent = await prisma.category.findUnique({ where: { id: parentId } });
		if (!parent) {
			throw new Error("NotFound: Danh mục cha (parentId) không tồn tại.");
		}
	}

	/** Kiểm tra xem `candidateId` có phải là hậu duệ (con/cháu...) của `ancestorId` hay không, để chặn vòng lặp phân cấp */
	private async isDescendantOf(candidateId: number, ancestorId: number): Promise<boolean> {
		let currentId: number | null = candidateId;

		while (currentId !== null) {
			if (currentId === ancestorId) return true;
			const current: { parentId: number | null } | null = await prisma.category.findUnique({
				where: { id: currentId },
				select: { parentId: true },
			});
			currentId = current?.parentId ?? null;
		}

		return false;
	}

	/** Sinh slug duy nhất từ tên/slug đề xuất, tự thêm hậu tố -2, -3... nếu bị trùng */
	private async resolveUniqueSlug(source: string): Promise<string> {
		const baseSlug = slugify(source);
		if (!baseSlug) {
			throw new Error("BadRequest: Không thể tạo slug hợp lệ từ tên danh mục đã cho.");
		}

		let candidate = baseSlug;
		let suffix = 2;

		while (await prisma.category.findUnique({ where: { slug: candidate } })) {
			candidate = `${baseSlug}-${suffix}`;
			suffix += 1;
		}

		return candidate;
	}
}

export default new CategoryService();
