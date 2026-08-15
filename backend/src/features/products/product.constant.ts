export const productSort = Object.freeze({
	newest: "newest",
	name_asc: "name_asc",
	name_desc: "name_desc",
	price_asc: "price_asc",
	price_desc: "price_desc",
	popular: "popular",
} as const);

export const listProductSort = Object.keys(productSort);

export type productSortType = (typeof productSort)[keyof typeof productSort];

export type productPriceSortType = Exclude<productSortType, ["popular", "newest", "name_asc", "name_desc"]>;

// Giá trị mặc định khi admin tạo biến thể mà không nhập khối lượng/kích thước — khớp với default
// của các cột weight_gram/length_cm/width_cm/height_cm ở product_sku (prisma/schema.prisma), để
// hành vi giống hệt dù có truyền field hay không. Admin nên cập nhật lại cho đúng thực tế sau đó,
// vì các giá trị này ảnh hưởng trực tiếp tới phí vận chuyển GHN tính cho từng đơn hàng.
export const DEFAULT_SKU_WEIGHT_GRAM = 500;
export const DEFAULT_SKU_LENGTH_CM = 20;
export const DEFAULT_SKU_WIDTH_CM = 20;
export const DEFAULT_SKU_HEIGHT_CM = 20;
