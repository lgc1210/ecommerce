import type { ProductCardItem, PublicProductListItem, PublicProductSku, PublicProductSkuSummary, VariationDetails } from "../types";

/** Tính khoảng giá (min/max) từ danh sách SKU — price là Decimal serialize thành string nên phải Number(...) trước. */
export function computePriceRange(skus: Array<PublicProductSkuSummary | PublicProductSku>): {
	min: number;
	max: number;
} {
	if (!skus || skus.length === 0) return { min: 0, max: 0 };
	const prices = skus.map((sku) => Number(sku.price));
	return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Sản phẩm còn hàng nếu có ít nhất 1 SKU còn tồn kho. */
export function isProductInStock(skus: Array<PublicProductSkuSummary | PublicProductSku>): boolean {
	return (skus ?? []).some((sku) => sku.stockQuantity > 0);
}

/** Ảnh đại diện dùng cho card/listing — ưu tiên thumbnailUrl (đã đồng bộ ở backend), fallback placeholder. */
const FALLBACK_IMAGE = "https://placehold.co/600x600/f3ede4/1c1815?font=montserrat&text=San+pham";

export function getProductThumbnail(product: { thumbnailUrl: string | null }): string {
	return product.thumbnailUrl ?? FALLBACK_IMAGE;
}

/**
 * Chuyển 1 sản phẩm từ API (GET /products) sang shape tối thiểu mà <ProductCard> cần.
 * Giá hiển thị là giá thấp nhất trong các SKU (giá "từ"); không có rating vì danh sách công khai
 * không trả điểm đánh giá trung bình (chỉ có _count.reviews).
 */
export function toProductCardItem(product: PublicProductListItem): ProductCardItem {
	const { min } = computePriceRange(product.skus);
	return {
		slug: product.slug,
		name: product.name,
		price: min,
		reviewCount: product._count.reviews,
		inStock: isProductInStock(product.skus),
		isActive: product.isActive,
		image: getProductThumbnail(product),
	};
}

/** Rút gọn thuộc tính biến thể thành chuỗi hiển thị, vd: { color: "Đen", size: "M" } -> "Đen / M". */
export function formatVariationDetails(variationDetails: VariationDetails): string {
	return Object.values(variationDetails).filter(Boolean).join(" / ");
}

/** Danh sách các thuộc tính biến thể (vd: "color", "size") xuất hiện trong toàn bộ SKU của sản phẩm, giữ nguyên thứ tự xuất hiện đầu tiên. */
export function collectVariationAttributes(skus: PublicProductSku[]): string[] {
	const attributes: string[] = [];
	for (const sku of skus) {
		for (const key of Object.keys(sku.variationDetails ?? {})) {
			if (!attributes.includes(key)) attributes.push(key);
		}
	}
	return attributes;
}

/** Các giá trị khả dụng cho 1 thuộc tính biến thể (vd: attribute="color" -> ["Đen", "Trắng"]), giữ nguyên thứ tự xuất hiện. */
export function collectAttributeValues(skus: PublicProductSku[], attribute: string): string[] {
	const values: string[] = [];
	for (const sku of skus) {
		const value = sku.variationDetails?.[attribute];
		if (value && !values.includes(value)) values.push(value);
	}
	return values;
}

/** Tìm SKU khớp chính xác với tổ hợp lựa chọn hiện tại (vd: { color: "Đen", size: "M" }). */
export function findMatchingSku(skus: PublicProductSku[], selected: VariationDetails): PublicProductSku | undefined {
	return skus.find((sku) => Object.entries(selected).every(([key, value]) => sku.variationDetails?.[key] === value));
}

/** SKU mặc định khi mới vào trang: ưu tiên SKU đầu tiên còn hàng, nếu tất cả hết hàng thì lấy SKU đầu tiên. */
export function pickDefaultSku(skus: PublicProductSku[]): PublicProductSku | undefined {
	return skus.find((sku) => sku.stockQuantity > 0) ?? skus[0];
}

/** Ảnh của 1 SKU, sắp theo isPrimary rồi sortOrder (khớp thứ tự backend trả về), fallback về mảng rỗng. */
export function getSkuImages(sku: PublicProductSku | undefined): string[] {
	if (!sku || !sku.images || sku.images.length === 0) return [];
	return [...sku.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder).map((image) => image.imageUrl);
}
