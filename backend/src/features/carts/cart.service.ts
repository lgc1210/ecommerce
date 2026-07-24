import prisma from "../../config/prisma.js";
import { computeCartTotals } from "./cart.utils.js";

interface AddCartItemInput {
	productSkuId: number;
	quantity: number;
}

const cartItemInclude = {
	productSku: {
		include: {
			product: { select: { id: true, name: true, slug: true, isActive: true, thumbnailUrl: true } },
			// Khớp thứ tự sort với features/products/product.service.ts để FE dùng chung logic chọn
			// ảnh đại diện (images[0] sau khi sort) cho cả trang chi tiết sản phẩm lẫn giỏ hàng.
			images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
		},
	},
};

const cartInclude = {
	items: {
		include: cartItemInclude,
		orderBy: { id: "asc" as const },
	},
};

class CartService {
	// ==========================================
	// Self-service: xem giỏ hàng
	// ==========================================
	async getCart(userId: number) {
		const cart = await this.getOrCreateCart(userId);
		return { ...cart, ...computeCartTotals(cart.items) };
	}

	// ==========================================
	// Self-service: thao tác trên item
	// ==========================================
	async addItem(userId: number, data: AddCartItemInput) {
		const sku = await this.assertSkuAvailable(data.productSkuId);
		const cart = await this.getOrCreateCart(userId);

		const existing = cart.items.find((item) => item.productSkuId === data.productSkuId);
		const desiredQuantity = (existing?.quantity ?? 0) + data.quantity;

		if (desiredQuantity > sku.stockQuantity) {
			throw new Error(
				`BadRequest: Chỉ còn ${sku.stockQuantity} sản phẩm trong kho, không thể thêm ${desiredQuantity} vào giỏ hàng.`,
			);
		}

		if (existing) {
			await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQuantity } });
		} else {
			await prisma.cartItem.create({
				data: { cartId: cart.id, productSkuId: data.productSkuId, quantity: data.quantity },
			});
		}

		return this.getCart(userId);
	}

	async updateItemQuantity(userId: number, itemId: number, quantity: number) {
		const item = await this.getOwnedItemOrThrow(userId, itemId);

		if (quantity > item.productSku.stockQuantity) {
			throw new Error(`BadRequest: Chỉ còn ${item.productSku.stockQuantity} sản phẩm trong kho.`);
		}

		await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
		return this.getCart(userId);
	}

	async removeItem(userId: number, itemId: number) {
		await this.getOwnedItemOrThrow(userId, itemId);
		await prisma.cartItem.delete({ where: { id: itemId } });
		return this.getCart(userId);
	}

	async clearCart(userId: number) {
		const cart = await this.getOrCreateCart(userId);
		await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
	}

	async mergeLocalCartToDb(userId: number, pendingCartItems: AddCartItemInput[]) {
		const skippedItems: { productSkuId: number; reason: "not_found" | "out_of_stock" }[] = [];

		// Phòng thủ: lọc bỏ item thiếu/sai kiểu productSkuId hoặc quantity (vd. dữ liệu giỏ hàng
		// cục bộ cũ/hỏng còn sót lại ở localStorage phía client) — tránh đưa `undefined`/NaN vào
		// query Prisma bên dưới, dù validate() ở tầng route có bỏ sót thì hàm này vẫn an toàn.
		const validPendingItems = pendingCartItems.filter(
			(item) =>
				Number.isInteger(item?.productSkuId) &&
				item.productSkuId > 0 &&
				Number.isInteger(item?.quantity) &&
				item.quantity > 0,
		);

		if (validPendingItems.length === 0) {
			return { cart: await this.getCart(userId), skippedItems };
		}

		const cart = await this.getOrCreateCart(userId);

		// Merge duplicate SKUs from localStorage first
		const mergedLocalItems = new Map<number, number>();

		for (const item of validPendingItems) {
			mergedLocalItems.set(item.productSkuId, (mergedLocalItems.get(item.productSkuId) ?? 0) + item.quantity);
		}

		const skuIds = [...mergedLocalItems.keys()];

		// Load all valid SKUs in one query
		const skus = await prisma.productSku.findMany({
			where: {
				id: { in: skuIds },
				product: {
					isActive: true,
				},
			},
			select: {
				id: true,
				stockQuantity: true,
			},
		});

		const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

		// Existing cart items
		const existingMap = new Map(cart.items.map((item) => [item.productSkuId, item]));

		const operations = [];

		for (const [skuId, localQty] of mergedLocalItems) {
			const sku = skuMap.get(skuId);

			// Skip deleted / inactive products
			if (!sku) {
				skippedItems.push({ productSkuId: skuId, reason: "not_found" });
				continue;
			}

			// Skip out-of-stock products
			if (sku.stockQuantity <= 0) {
				skippedItems.push({ productSkuId: skuId, reason: "out_of_stock" });
				continue;
			}

			const existing = existingMap.get(skuId);

			if (existing) {
				const newQuantity = Math.min(existing.quantity + localQty, sku.stockQuantity);

				if (newQuantity !== existing.quantity) {
					operations.push(
						prisma.cartItem.update({
							where: { id: existing.id },
							data: { quantity: newQuantity },
						}),
					);
				}
			} else {
				operations.push(
					prisma.cartItem.create({
						data: {
							cartId: cart.id,
							productSkuId: skuId,
							quantity: Math.min(localQty, sku.stockQuantity),
						},
					}),
				);
			}
		}

		if (operations.length > 0) {
			await prisma.$transaction(operations);
		}

		return { cart: await this.getCart(userId), skippedItems };
	}

	// ==========================================
	// Helpers
	// ==========================================
	/** Mỗi user chỉ có 1 giỏ hàng (Cart.userId là unique) -> tự tạo nếu chưa có, tránh phải seed thủ công */
	private async getOrCreateCart(userId: number) {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: cartInclude,
		});
		if (cart) return cart;

		return prisma.cart.create({
			data: { userId },
			include: cartInclude,
		});
	}

	private async assertSkuAvailable(productSkuId: number) {
		const sku = await prisma.productSku.findUnique({
			where: { id: productSkuId },
			include: { product: { select: { isActive: true } } },
		});

		if (!sku || (sku.product && !sku.product.isActive)) {
			throw new Error("NotFound: Biến thể sản phẩm không tồn tại hoặc đã ngừng kinh doanh.");
		}
		if (sku.stockQuantity <= 0) {
			throw new Error("BadRequest: Sản phẩm này đã hết hàng.");
		}

		return sku;
	}

	/** Đảm bảo cart item tồn tại và thuộc đúng giỏ hàng của user đang thao tác (owned data check) */
	private async getOwnedItemOrThrow(userId: number, itemId: number) {
		const item = await prisma.cartItem.findUnique({
			where: { id: itemId },
			include: { cart: true, productSku: true },
		});

		if (!item || item.cart.userId !== userId) {
			throw new Error("NotFound: Mục giỏ hàng không tồn tại.");
		}

		return item;
	}
}

export default new CartService();
