export declare const productSort: Readonly<{
    readonly newest: "newest";
    readonly name_asc: "name_asc";
    readonly name_desc: "name_desc";
    readonly price_asc: "price_asc";
    readonly price_desc: "price_desc";
    readonly popular: "popular";
}>;
export declare const listProductSort: string[];
export type productSortType = (typeof productSort)[keyof typeof productSort];
export type productPriceSortType = Exclude<productSortType, ["popular", "newest", "name_asc", "name_desc"]>;
export declare const DEFAULT_SKU_WEIGHT_GRAM = 500;
export declare const DEFAULT_SKU_LENGTH_CM = 20;
export declare const DEFAULT_SKU_WIDTH_CM = 20;
export declare const DEFAULT_SKU_HEIGHT_CM = 20;
//# sourceMappingURL=product.constant.d.ts.map