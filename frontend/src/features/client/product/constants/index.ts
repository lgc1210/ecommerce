export const productSort = Object.freeze({
	newest: "newest",
	name_asc: "name_asc",
	name_desc: "name_desc",
	price_asc: "price_asc",
	price_desc: "price_desc",
	popular: "popular",
} as const);

export const listProductSort = Object.keys(productSort);
