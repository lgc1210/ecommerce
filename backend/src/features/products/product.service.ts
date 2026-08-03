import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import {
	computeAverageRating,
	buildSkuBaseCode,
	DEFAULT_SKU_WEIGHT_GRAM,
	DEFAULT_SKU_LENGTH_CM,
	DEFAULT_SKU_WIDTH_CM,
	DEFAULT_SKU_HEIGHT_CM,
} from "./product.utils.js";
import { parsePagination, slugify } from "../../utils/index.js";
import type {
	CreateProductInput,
	ListProductsParams,
	SkuInput,
	UpdateProductInput,
	UpdateSkuInput,
} from "./product.type.js";

const productListInclude = {
	category: { select: { id: true, name: true, slug: true } },
	skus: { select: { id: true, sku: true, price: true, stockQuantity: true, variationDetails: true } },
	_count: { select: { reviews: true } },
	// Ảnh đại diện lấy từ cột `thumbnailUrl` (denormalized, tự đồng bộ khi ảnh SKU thay đổi) -> không cần join images ở đây
};

// Sản phẩm liên quan (trả kèm trong getProductBySlug): số lượng cố định, không nhận limit từ client
const RELATED_PRODUCTS_LIMIT = 8;

const productDetailInclude = {
	category: { select: { id: true, name: true, slug: true } },
	skus: {
		include: {
			images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
		},
	},
	reviews: {
		orderBy: { createdAt: "desc" as const },
		take: 20,
		include: { user: { select: { id: true, name: true } } },
	},
};

class ProductService {
	// ==========================================
	// Public
	// ==========================================
	async listProducts(params: ListProductsParams) {
		const where: Record<string, unknown> = {};

		// `isActive` chỉ lọc khi client truyền tường minh qua query param — áp dụng như nhau cho cả route
		// public lẫn admin. Mặc định (không truyền) trả về TẤT CẢ sản phẩm (active lẫn inactive), để khớp
		// với _count.products ở categories (đếm tất cả sản phẩm, không phân biệt isActive) — tránh lệch số
		// lượng hiển thị giữa bộ đếm danh mục và danh sách sản phẩm thực tế trả về.
		// `options.publicOnly` không còn dùng để ép isActive nữa; sản phẩm inactive vẫn được trả ra ở route
		// public, phía frontend tự quyết định UI/UX phù hợp (vd: badge "Ngừng kinh doanh") thay vì ẩn hẳn.
		if (params.isActive !== undefined) {
			where.isActive = params.isActive === "true";
		}

		if (params.search) {
			where.name = { contains: params.search };
		}

		if (params.categoryId) {
			where.categoryId = Number(params.categoryId);
		}

		if (params.minPrice || params.maxPrice) {
			const priceFilter: Record<string, number> = {};
			if (params.minPrice) priceFilter.gte = Number(params.minPrice);
			if (params.maxPrice) priceFilter.lte = Number(params.maxPrice);
			where.skus = { some: { price: priceFilter } };
		}

		const orderBy = this.resolveSortOrder(params.sort);

		const { page, limit, skip } = parsePagination(params);
		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				include: productListInclude,
				orderBy,
				skip,
				take: limit,
			}),
			prisma.product.count({ where }),
		]);

		return {
			data: products,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getProductBySlug(slug: string, options: { publicOnly: boolean }) {
		const product = await prisma.product.findUnique({
			where: { slug },
			include: productDetailInclude,
		});

		if (!product || (options.publicOnly && !product.isActive)) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		const related = await this.findRelatedProducts(product.id, product.categoryId);

		return { ...product, averageRating: computeAverageRating(product.reviews), related };
	}

	// ==========================================
	// Admin - Product
	// ==========================================
	async getProductById(id: number) {
		const product = await prisma.product.findUnique({
			where: { id },
			include: productDetailInclude,
		});

		if (!product) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		return { ...product, averageRating: computeAverageRating(product.reviews) };
	}

	async createProduct(data: CreateProductInput) {
		if (data.categoryId) {
			await this.assertCategoryExists(data.categoryId);
		}

		const providedSkuCodes = (data.skus ?? []).map((s) => s.sku).filter((code): code is string => !!code);
		if (providedSkuCodes.length > 0) {
			await this.assertSkuCodesAvailable(providedSkuCodes);
		}

		const slug = await this.resolveUniqueSlug(data.slug ?? data.name);

		const createData: Record<string, unknown> = {
			name: data.name,
			slug,
			description: data.description ?? null,
			categoryId: data.categoryId ?? null,
			isActive: data.isActive ?? true,
			// Thumbnail chọn thủ công lúc tạo sản phẩm (chưa có SKU/ảnh biến thể nào). Lưu ý:
			// giá trị này sẽ bị syncProductThumbnail() ghi đè ngay khi SKU đầu tiên có ảnh được
			// thêm vào — xem addSkuImage/updateSkuImage/deleteSkuImage bên dưới.
			thumbnailUrl: data.thumbnailUrl ?? null,
		};

		if (data.skus && data.skus.length > 0) {
			// Set dùng để tránh sinh trùng mã SKU ngay trong cùng 1 request (vd: 2 biến thể cùng thiếu mã và trùng gợi ý)
			const reservedCodes = new Set<string>(providedSkuCodes);
			const resolvedSkus = [];
			for (const s of data.skus) {
				const sku =
					s.sku ?? (await this.resolveUniqueSkuCode(buildSkuBaseCode(data.name, s.variationDetails), reservedCodes));
				resolvedSkus.push({
					sku,
					price: s.price,
					stockQuantity: s.stockQuantity ?? 0,
					variationDetails: s.variationDetails as Prisma.InputJsonValue,
					weightGram: s.weightGram ?? DEFAULT_SKU_WEIGHT_GRAM,
					lengthCm: s.lengthCm ?? DEFAULT_SKU_LENGTH_CM,
					widthCm: s.widthCm ?? DEFAULT_SKU_WIDTH_CM,
					heightCm: s.heightCm ?? DEFAULT_SKU_HEIGHT_CM,
				});
			}
			createData.skus = { create: resolvedSkus };
		}

		return prisma.product.create({
			data: createData as any,
			include: productDetailInclude,
		});
	}

	async updateProduct(id: number, data: UpdateProductInput) {
		const existing = await prisma.product.findUnique({ where: { id } });
		if (!existing) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		const updateData: Record<string, unknown> = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.isActive !== undefined) updateData.isActive = data.isActive;
		// Cũng có thể bị syncProductThumbnail() ghi đè sau đó nếu ảnh biến thể thay đổi (xem createProduct).
		if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

		if (data.slug !== undefined && data.slug !== existing.slug) {
			const slugOwner = await prisma.product.findUnique({ where: { slug: data.slug } });
			if (slugOwner) {
				throw new Error("Conflict: Slug này đã được sử dụng bởi sản phẩm khác.");
			}
			updateData.slug = data.slug;
		}

		if (data.categoryId !== undefined) {
			if (data.categoryId !== null) {
				await this.assertCategoryExists(data.categoryId);
			}
			updateData.categoryId = data.categoryId;
		}

		return prisma.product.update({ where: { id }, data: updateData, include: productDetailInclude });
	}

	async deleteProduct(id: number) {
		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				_count: { select: { reviews: true } },
				skus: { include: { _count: { select: { cartItems: true, orderItems: true } } } },
			},
		});

		if (!product) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}

		if (product._count.reviews > 0) {
			throw new Error(
				"Conflict: Không thể xóa sản phẩm vì đã có đánh giá. Hãy vô hiệu hóa (isActive=false) thay vì xóa.",
			);
		}

		const hasReferencedSku = product.skus.some((s) => s._count.cartItems > 0 || s._count.orderItems > 0);
		if (hasReferencedSku) {
			throw new Error(
				"Conflict: Không thể xóa sản phẩm vì có biến thể đang nằm trong giỏ hàng hoặc đơn hàng. Hãy vô hiệu hóa thay vì xóa.",
			);
		}

		await prisma.$transaction([
			prisma.productImage.deleteMany({ where: { productSku: { productId: id } } }),
			prisma.productSku.deleteMany({ where: { productId: id } }),
			prisma.product.delete({ where: { id } }),
		]);
	}

	// ==========================================
	// Admin - Product SKU (biến thể)
	// ==========================================
	async createSku(productId: number, data: SkuInput) {
		const product = await this.assertProductExists(productId);

		let sku: string;
		if (data.sku) {
			await this.assertSkuCodesAvailable([data.sku]);
			sku = data.sku;
		} else {
			sku = await this.resolveUniqueSkuCode(buildSkuBaseCode(product.name, data.variationDetails), new Set());
		}

		return prisma.productSku.create({
			data: {
				productId,
				sku,
				price: data.price,
				stockQuantity: data.stockQuantity ?? 0,
				variationDetails: data.variationDetails as Prisma.InputJsonValue,
				weightGram: data.weightGram ?? DEFAULT_SKU_WEIGHT_GRAM,
				lengthCm: data.lengthCm ?? DEFAULT_SKU_LENGTH_CM,
				widthCm: data.widthCm ?? DEFAULT_SKU_WIDTH_CM,
				heightCm: data.heightCm ?? DEFAULT_SKU_HEIGHT_CM,
			},
		});
	}

	async updateSku(productId: number, skuId: number, data: UpdateSkuInput) {
		const existing = await this.assertSkuBelongsToProduct(productId, skuId);

		const updateData: Record<string, unknown> = {};
		if (data.price !== undefined) updateData.price = data.price;
		if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
		if (data.variationDetails !== undefined)
			updateData.variationDetails = data.variationDetails as Prisma.InputJsonValue;
		if (data.weightGram !== undefined) updateData.weightGram = data.weightGram;
		if (data.lengthCm !== undefined) updateData.lengthCm = data.lengthCm;
		if (data.widthCm !== undefined) updateData.widthCm = data.widthCm;
		if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;

		if (data.sku !== undefined && data.sku !== existing.sku) {
			await this.assertSkuCodesAvailable([data.sku]);
			updateData.sku = data.sku;
		}

		return prisma.productSku.update({ where: { id: skuId }, data: updateData });
	}

	async updateSkuStock(productId: number, skuId: number, stockQuantity: number) {
		await this.assertSkuBelongsToProduct(productId, skuId);
		return prisma.productSku.update({ where: { id: skuId }, data: { stockQuantity } });
	}

	async deleteSku(productId: number, skuId: number) {
		await this.assertSkuBelongsToProduct(productId, skuId);

		const counts = await prisma.productSku.findUnique({
			where: { id: skuId },
			include: { _count: { select: { cartItems: true, orderItems: true } } },
		});

		if (counts && (counts._count.cartItems > 0 || counts._count.orderItems > 0)) {
			throw new Error("Conflict: Không thể xóa biến thể vì đang nằm trong giỏ hàng hoặc đơn hàng.");
		}

		await prisma.$transaction(async (tx) => {
			await tx.productImage.deleteMany({ where: { productSkuId: skuId } });
			await tx.productSku.delete({ where: { id: skuId } });
			await this.syncProductThumbnail(productId, tx);
		});
	}

	// ==========================================
	// Admin - Product SKU Images (ảnh theo từng biến thể)
	// ==========================================
	/** Thêm ảnh cho 1 SKU. Ảnh đầu tiên của SKU đó luôn tự động là ảnh đại diện (isPrimary), bất kể input truyền vào. */
	async addSkuImage(
		productId: number,
		skuId: number,
		data: { imageUrl: string; altText?: string; isPrimary?: boolean; sortOrder?: number },
	) {
		await this.assertSkuBelongsToProduct(productId, skuId);

		const existingCount = await prisma.productImage.count({ where: { productSkuId: skuId } });
		const isPrimary = existingCount === 0 ? true : (data.isPrimary ?? false);

		return prisma.$transaction(async (tx) => {
			if (isPrimary) {
				await tx.productImage.updateMany({
					where: { productSkuId: skuId, isPrimary: true },
					data: { isPrimary: false },
				});
			}

			const image = await tx.productImage.create({
				data: {
					productSkuId: skuId,
					imageUrl: data.imageUrl,
					altText: data.altText ?? null,
					isPrimary,
					sortOrder: data.sortOrder ?? existingCount,
				},
			});

			await this.syncProductThumbnail(productId, tx);
			return image;
		});
	}

	async updateSkuImage(
		productId: number,
		skuId: number,
		imageId: number,
		data: { imageUrl?: string; altText?: string | null; isPrimary?: boolean; sortOrder?: number },
	) {
		await this.assertImageBelongsToSku(skuId, imageId);
		await this.assertSkuBelongsToProduct(productId, skuId);

		return prisma.$transaction(async (tx) => {
			if (data.isPrimary === true) {
				// Chỉ 1 ảnh đại diện / SKU -> bỏ cờ isPrimary của ảnh khác trong cùng SKU trước khi gán cho ảnh này
				await tx.productImage.updateMany({
					where: { productSkuId: skuId, isPrimary: true, NOT: { id: imageId } },
					data: { isPrimary: false },
				});
			}

			const updateData: Record<string, unknown> = {};
			if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
			if (data.altText !== undefined) updateData.altText = data.altText;
			if (data.isPrimary !== undefined) updateData.isPrimary = data.isPrimary;
			if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

			const image = await tx.productImage.update({ where: { id: imageId }, data: updateData });

			// imageUrl hoặc isPrimary thay đổi đều có thể ảnh hưởng đến thumbnail cấp Product -> luôn đồng bộ lại cho chắc
			await this.syncProductThumbnail(productId, tx);
			return image;
		});
	}

	/** Xóa ảnh của SKU. Nếu ảnh bị xóa là ảnh đại diện, tự động gán ảnh còn lại (theo sortOrder) của cùng SKU làm ảnh đại diện mới. */
	async deleteSkuImage(productId: number, skuId: number, imageId: number) {
		const image = await this.assertImageBelongsToSku(skuId, imageId);
		await this.assertSkuBelongsToProduct(productId, skuId);

		await prisma.$transaction(async (tx) => {
			await tx.productImage.delete({ where: { id: imageId } });

			if (image.isPrimary) {
				const nextPrimary = await tx.productImage.findFirst({
					where: { productSkuId: skuId },
					orderBy: { sortOrder: "asc" },
				});
				if (nextPrimary) {
					await tx.productImage.update({ where: { id: nextPrimary.id }, data: { isPrimary: true } });
				}
			}

			await this.syncProductThumbnail(productId, tx);
		});
	}

	// ==========================================
	// Helpers
	// ==========================================
	/**
	 * Tìm sản phẩm liên quan tới `productId`, dùng để nhúng vào response của getProductBySlug.
	 * Chỉ lấy sản phẩm cùng danh mục (categoryId), đang active, sắp xếp theo mới nhất. Nếu sản phẩm
	 * không thuộc danh mục nào, hoặc danh mục đó không còn sản phẩm active nào khác, trả về mảng rỗng
	 * (không lấp đầy bằng sản phẩm khác danh mục).
	 */
	private async findRelatedProducts(productId: number, categoryId: number | null) {
		if (!categoryId) return [];

		return prisma.product.findMany({
			where: { isActive: true, categoryId, id: { not: productId } },
			include: productListInclude,
			orderBy: { createdAt: "desc" },
			take: RELATED_PRODUCTS_LIMIT,
		});
	}

	private resolveSortOrder(sort?: string) {
		switch (sort) {
			case "name_asc":
				return { name: "asc" as const };
			case "name_desc":
				return { name: "desc" as const };
			case "newest":
			default:
				return { createdAt: "desc" as const };
		}
	}

	private async assertCategoryExists(categoryId: number) {
		const category = await prisma.category.findUnique({ where: { id: categoryId } });
		if (!category) {
			throw new Error("NotFound: Danh mục (categoryId) không tồn tại.");
		}
	}

	private async assertProductExists(productId: number) {
		const product = await prisma.product.findUnique({ where: { id: productId } });
		if (!product) {
			throw new Error("NotFound: Sản phẩm không tồn tại.");
		}
		return product;
	}

	private async assertSkuBelongsToProduct(productId: number, skuId: number) {
		await this.assertProductExists(productId);
		const sku = await prisma.productSku.findUnique({ where: { id: skuId } });
		if (!sku || sku.productId !== productId) {
			throw new Error("NotFound: Biến thể (SKU) không tồn tại trong sản phẩm này.");
		}
		return sku;
	}

	private async assertImageBelongsToSku(skuId: number, imageId: number) {
		const image = await prisma.productImage.findUnique({ where: { id: imageId } });
		if (!image || image.productSkuId !== skuId) {
			throw new Error("NotFound: Ảnh không tồn tại trong biến thể (SKU) này.");
		}
		return image;
	}

	/**
	 * Đồng bộ lại `product.thumbnailUrl` (denormalized cache dùng cho trang danh sách, tránh phải join
	 * skus+images cho mỗi sản phẩm). Quy ước "ảnh mặc định" = ảnh primary (hoặc sortOrder nhỏ nhất nếu
	 * chưa có primary) của SKU có id nhỏ nhất trong số các SKU CÒN ảnh. Nếu sản phẩm không còn ảnh nào
	 * ở bất kỳ SKU nào, thumbnailUrl được đặt về null.
	 * Luôn gọi hàm này (trong cùng transaction) sau khi ảnh của 1 SKU được thêm/sửa/xóa.
	 */
	private async syncProductThumbnail(productId: number, tx: Prisma.TransactionClient | typeof prisma = prisma) {
		const defaultImage = await tx.productImage.findFirst({
			where: { productSku: { productId } },
			orderBy: [{ productSku: { id: "asc" } }, { isPrimary: "desc" }, { sortOrder: "asc" }],
		});

		await tx.product.update({ where: { id: productId }, data: { thumbnailUrl: defaultImage?.imageUrl ?? null } });
	}

	/** Kiểm tra danh sách mã SKU chưa bị trùng trong hệ thống (unique toàn cục) */
	private async assertSkuCodesAvailable(skuCodes: string[]) {
		const existing = await prisma.productSku.findMany({
			where: { sku: { in: skuCodes } },
			select: { sku: true },
		});
		if (existing.length > 0) {
			const dupes = existing.map((s) => s.sku).join(", ");
			throw new Error(`Conflict: Mã SKU đã tồn tại: ${dupes}.`);
		}
	}

	/** Sinh slug duy nhất từ tên/slug đề xuất, tự thêm hậu tố -2, -3... nếu bị trùng */
	private async resolveUniqueSlug(source: string): Promise<string> {
		const baseSlug = slugify(source);
		if (!baseSlug) {
			throw new Error("BadRequest: Không thể tạo slug hợp lệ từ tên sản phẩm đã cho.");
		}

		let candidate = baseSlug;
		let suffix = 2;

		while (await prisma.product.findUnique({ where: { slug: candidate } })) {
			candidate = `${baseSlug}-${suffix}`;
			suffix += 1;
		}

		return candidate;
	}

	/**
	 * Sinh mã SKU duy nhất từ mã gợi ý (vd: "ATCB-DEN-M"), tự thêm hậu tố -2, -3... nếu bị trùng.
	 * `reservedCodes` dùng để tránh trùng ngay trong cùng 1 request (khi tạo nhiều SKU cùng lúc).
	 */
	private async resolveUniqueSkuCode(baseCode: string, reservedCodes: Set<string>): Promise<string> {
		let candidate = baseCode;
		let suffix = 2;

		while (reservedCodes.has(candidate) || (await prisma.productSku.findUnique({ where: { sku: candidate } }))) {
			candidate = `${baseCode}-${suffix}`;
			suffix += 1;
		}

		reservedCodes.add(candidate);
		return candidate;
	}
}

export default new ProductService();
