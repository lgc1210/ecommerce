import { slugify } from "../../utils/index.js";

// Giá trị mặc định khi admin tạo biến thể mà không nhập khối lượng/kích thước — khớp với default
// của các cột weight_gram/length_cm/width_cm/height_cm ở product_sku (prisma/schema.prisma), để
// hành vi giống hệt dù có truyền field hay không. Admin nên cập nhật lại cho đúng thực tế sau đó,
// vì các giá trị này ảnh hưởng trực tiếp tới phí vận chuyển GHN tính cho từng đơn hàng.
export const DEFAULT_SKU_WEIGHT_GRAM = 500;
export const DEFAULT_SKU_LENGTH_CM = 20;
export const DEFAULT_SKU_WIDTH_CM = 20;
export const DEFAULT_SKU_HEIGHT_CM = 20;

/** Tính điểm đánh giá trung bình từ danh sách review, làm tròn 1 chữ số thập phân */
export function computeAverageRating(reviews: Array<{ rating: number }>): number | null {
	if (!reviews || reviews.length === 0) return null;
	const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
	return Math.round((sum / reviews.length) * 10) / 10;
}

/** Tính khoảng giá (min/max) từ danh sách SKU của sản phẩm, dùng để hiển thị nhanh ngoài danh sách */
export function computePriceRange(skus: Array<{ price: unknown }>): { min: number | null; max: number | null } {
	if (!skus || skus.length === 0) return { min: null, max: null };
	const prices = skus.map((sku) => Number(sku.price));
	return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Rút gọn tên sản phẩm thành chữ viết tắt in hoa, vd: "Áo Thun Cotton Basic" -> "ATCB" */
function toAcronym(name: string): string {
	const acronym = slugify(name)
		.split("-")
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
	return acronym || "SKU";
}

/** Rút gọn các giá trị biến thể (vd: {color: "Đen", size: "M"}) thành mã ngắn, vd: "DEN-M" */
function toVariationCode(variationDetails: Record<string, unknown>): string {
	return Object.values(variationDetails)
		.map((value) => slugify(String(value)).replace(/-/g, "").slice(0, 3).toUpperCase())
		.filter(Boolean)
		.join("-");
}

/** Sinh mã SKU gợi ý (chưa đảm bảo duy nhất) từ tên sản phẩm + thuộc tính biến thể, vd: "ATCB-DEN-M" */
export function buildSkuBaseCode(productName: string, variationDetails: Record<string, unknown>): string {
	const acronym = toAcronym(productName);
	const variationCode = toVariationCode(variationDetails);
	return variationCode ? `${acronym}-${variationCode}` : acronym;
}
