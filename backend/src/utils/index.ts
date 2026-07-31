export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Parse & chuẩn hóa tham số phân trang từ query string, có giới hạn an toàn */
export function parsePagination(query: { page?: string; limit?: string }) {
	const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
	const rawLimit = parseInt(query.limit ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
	const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, rawLimit));
	const skip = (page - 1) * limit;

	return { page, limit, skip };
}

/** Chuyển chuỗi (kể cả tiếng Việt có dấu) thành dạng slug URL-safe, vd: "Áo Thun Nam" -> "ao-thun-nam" */
export function slugify(input: string): string {
	return input
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Bỏ dấu (combining diacritical marks)
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
