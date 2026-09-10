/**
 * Seed danh mục sản phẩm theo cấu trúc CÂY NHIỀU TẦNG (danh mục gốc -> danh mục con -> danh mục chi tiết).
 * Dùng upsert theo slug nên chạy lại nhiều lần vẫn an toàn (idempotent), không tạo trùng lặp và
 * không ghi đè dữ liệu khác của danh mục đã tồn tại (chỉ đồng bộ lại name/description/parentId).
 *
 * Trả về Map<tên danh mục, id> cho TẤT CẢ danh mục đã seed (mọi tầng) để các seed khác
 * (vd: product.seed.ts) có thể tra cứu categoryId theo tên khi gán sản phẩm vào danh mục.
 */
export declare const categorySeed: () => Promise<Map<string, number>>;
//# sourceMappingURL=category.seed.d.ts.map