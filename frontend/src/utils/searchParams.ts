/**
 * Các hàm parse 1 query param sang đúng kiểu dữ liệu — dùng cùng với `useListQueryParams`
 * (hook đó trả về `searchParams`, phần filter riêng của từng trang tự gọi các hàm này).
 *
 * Cố tình KHÔNG gộp vào `useListQueryParams`: hook đó dùng chung cho mọi trang nên không được
 * biết trước tên/kiểu filter của từng trang (categoryId, isActive, discountType...) — biết
 * trước sẽ làm hook phình to và ràng buộc ngược vào domain. Các hàm dưới đây thuần là "parse 1
 * giá trị", trang nào cần thì tự gọi, tự đặt tên biến theo đúng domain của mình.
 */

/** "5" -> 5, thiếu/"" -> undefined. Dùng cho filter dạng ID (categoryId, roleId...). */
export const parseNumberParam = (searchParams: URLSearchParams, key: string): number | undefined => {
	const raw = searchParams.get(key);
	return raw ? Number(raw) : undefined;
};

/** "true"/"false" -> true/false, thiếu param -> undefined (khác với "false"). Dùng cho filter isActive... */
export const parseBooleanParam = (searchParams: URLSearchParams, key: string): boolean | undefined => {
	const raw = searchParams.get(key);
	return raw === null ? undefined : raw === "true";
};

/** Trả nguyên chuỗi (ép kiểu literal union T), thiếu param -> undefined. Dùng cho filter dạng enum (sort, status, discountType...). */
export const parseEnumParam = <T extends string>(searchParams: URLSearchParams, key: string): T | undefined => (searchParams.get(key) as T | null) ?? undefined;
