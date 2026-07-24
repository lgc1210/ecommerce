import type { ProductSkuSummary, VariationDetails } from "../types";

/** { color: "Đỏ", size: "M" } -> "Đỏ / M" — hiển thị gọn thuộc tính biến thể trên 1 dòng. */
export function formatVariationDetails(variationDetails: VariationDetails): string {
	const values = Object.values(variationDetails).filter(Boolean);
	return values.length > 0 ? values.join(" / ") : "—";
}

/** Khoảng giá nhỏ nhất - lớn nhất trong các SKU của 1 sản phẩm (giá đã là số, không phải Decimal string ở đây). */
export function getPriceRange(skus: ProductSkuSummary[]): { min: number; max: number } | null {
	if (skus.length === 0) return null;
	const prices = skus.map((s) => Number(s.price));
	return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Tổng tồn kho của tất cả SKU thuộc 1 sản phẩm. */
export function getTotalStock(skus: ProductSkuSummary[]): number {
	return skus.reduce((sum, sku) => sum + sku.stockQuantity, 0);
}
