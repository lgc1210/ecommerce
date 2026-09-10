/** Tính điểm đánh giá trung bình từ danh sách review, làm tròn 1 chữ số thập phân */
export declare function computeAverageRating(reviews: Array<{
    rating: number;
}>): number | null;
/** Tính khoảng giá (min/max) từ danh sách SKU của sản phẩm, dùng để hiển thị nhanh ngoài danh sách */
export declare function computePriceRange(skus: Array<{
    price: unknown;
}>): {
    min: number | null;
    max: number | null;
};
/** Sinh mã SKU gợi ý (chưa đảm bảo duy nhất) từ tên sản phẩm + thuộc tính biến thể, vd: "ATCB-DEN-M" */
export declare function buildSkuBaseCode(productName: string, variationDetails: Record<string, unknown>): string;
//# sourceMappingURL=product.utils.d.ts.map