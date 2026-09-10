interface SeedSkuInput {
    sku: string;
    price: number;
    oldPrice?: number;
    stockQuantity: number;
    variationDetails: Record<string, string>;
}
interface SeedProductInput {
    name: string;
    description: string;
    categoryName: string;
    isActive?: boolean;
    skus: SeedSkuInput[];
}
export declare const seedProducts: SeedProductInput[];
/**
 * Seed dữ liệu sản phẩm công nghệ mẫu cho môi trường phát triển/demo.
 * Danh mục (nhiều tầng) được seed riêng trong category.seed.ts và chạy trước productSeed trong server.ts;
 * ở đây chỉ cần tra cứu categoryId theo tên danh mục (tầng lá) để gán vào từng sản phẩm.
 * Chỉ chạy khi bảng products hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn sản phẩm.
 */
export declare const productSeed: () => Promise<void>;
export {};
//# sourceMappingURL=product.seed.d.ts.map