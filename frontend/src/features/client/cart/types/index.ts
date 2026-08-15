import type { VariationDetails, PublicProductImage } from "../../product/types";

/**
 * 1 dòng trong giỏ hàng CỤC BỘ (khách chưa đăng nhập), lưu ở zustand + localStorage.
 * Giỏ hàng thật nằm ở cấp SKU/biến thể (khớp CartItem.productSkuId ở backend), nên phải lưu
 * theo `productSkuId`, không phải `slug` sản phẩm. Vì khách chưa đăng nhập không gọi được
 * GET /cart (yêu cầu JWT), các trường hiển thị (tên, ảnh, giá, biến thể, tồn kho) phải được
 * lưu kèm dưới dạng "snapshot" tại thời điểm thêm vào giỏ, để trang giỏ hàng tự render được
 * mà không cần gọi API. Snapshot này chỉ mang tính tham khảo hiển thị — giá/tồn kho THẬT luôn
 * được backend xác thực lại khi merge vào DB hoặc khi đặt hàng.
 */
export interface LocalCartItem {
	productSkuId: number;
	productSlug: string;
	productName: string;
	image: string;
	sku: string;
	variationDetails: VariationDetails;
	/** Giá tại thời điểm thêm vào giỏ (Number, không phải Decimal string). */
	price: number;
	oldPrice: number | null;
	quantity: number;
	/** Tồn kho tại thời điểm thêm vào giỏ, dùng để giới hạn +/- ở phía client trước khi đăng nhập. */
	stockQuantity: number;
}

/** Payload cần có để thêm 1 dòng vào giỏ — dùng chung cho cả 2 nhánh (local/server) ở useCart(). */
export type AddToCartPayload = Omit<LocalCartItem, "quantity"> & { quantity?: number };

// ==========================================
// Giỏ hàng phía SERVER (khách đã đăng nhập) — khớp cartInclude/computeCartTotals ở backend
// ==========================================
export interface ServerCartItem {
	id: number;
	productSkuId: number;
	quantity: number;
	productSku: {
		id: number;
		sku: string;
		/** Prisma Decimal -> serialize qua JSON thành string. */
		price: string;
		oldPrice: string | null;
		stockQuantity: number;
		variationDetails: VariationDetails;
		/** Đã sort isPrimary desc, sortOrder asc ở backend — khớp features/products/product.service.ts. */
		images: PublicProductImage[];
		product: {
			id: number;
			name: string;
			slug: string;
			isActive: boolean;
			thumbnailUrl: string | null;
		} | null;
	};
}

export interface ServerCart {
	id: number;
	userId: number;
	items: ServerCartItem[];
	totalItems: number;
	totalQuantity: number;
	subtotal: number;
}

export type SkippedCartItemReason = "not_found" | "out_of_stock";

export interface SkippedCartItem {
	productSkuId: number;
	reason: SkippedCartItemReason;
}

// ==========================================
// Shape hợp nhất dùng để RENDER, không phân biệt nguồn dữ liệu (local hay server) —
// xem useCart() ở features/client/cart/hooks.
// ==========================================
export interface CartLineView {
	/** Key ổn định cho React list: "server-<itemId>" hoặc "local-<productSkuId>". */
	id: string;
	/** Chỉ có khi dòng này đến từ server cart — dùng để gọi PATCH/DELETE /cart/items/:itemId. */
	itemId?: number;
	productSkuId: number;
	productSlug: string;
	productName: string;
	image: string;
	sku: string;
	variationDetails: VariationDetails;
	price: number;
	oldPrice: number | null;
	quantity: number;
	stockQuantity: number;
	/** false khi sản phẩm đã ngừng kinh doanh hoặc hết hàng (chỉ xác định chắc chắn ở server cart). */
	inStock: boolean;
}
