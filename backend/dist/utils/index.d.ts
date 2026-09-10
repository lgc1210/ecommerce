export declare const DEFAULT_PAGE_SIZE = 10;
export declare const MAX_PAGE_SIZE = 100;
/** Parse & chuẩn hóa tham số phân trang từ query string, có giới hạn an toàn */
export declare function parsePagination(query: {
    page?: string | undefined;
    limit?: string | undefined;
}): {
    page: number;
    limit: number;
    skip: number;
};
/** Chuyển chuỗi (kể cả tiếng Việt có dấu) thành dạng slug URL-safe, vd: "Áo Thun Nam" -> "ao-thun-nam" */
export declare function slugify(input: string): string;
/**
 * Sinh URL ảnh placeholder có hiển thị TRỰC TIẾP tên sản phẩm/biến thể trên ảnh
 * (qua dịch vụ placehold.co), thay vì ảnh ngẫu nhiên không liên quan (picsum.photos trước đây).
 * Nhờ vậy ảnh luôn khớp đúng với tên sản phẩm dù không phải ảnh chụp thật.
 */
export declare const buildPlaceholderImageUrl: (text: string) => string;
export declare const sleep: (ms: number) => Promise<void>;
//# sourceMappingURL=index.d.ts.map