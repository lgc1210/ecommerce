import { useEffect, useState } from "react";

/**
 * Trả về `value` sau khi đã "im lặng" (không đổi) trong `delayMs` mili giây.
 * Dùng cho ô search: bind trực tiếp state gõ vào input (mượt, không lag), rồi
 * chỉ dùng giá trị debounce này để gọi API / set URL param — tránh bắn request
 * hay ghi URL/history mỗi ký tự gõ.
 *
 * ```tsx
 * const [searchInput, setSearchInput] = useState("");
 * const debouncedSearch = useDebouncedValue(searchInput, 400);
 *
 * useEffect(() => {
 *   // set URL param / gọi API bằng debouncedSearch, không phải searchInput
 * }, [debouncedSearch]);
 * ```
 */
const useDebounced = <T>(value: T, delay: number = 400): T => {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => clearTimeout(timeoutId);
	}, [value, delay]);
	return debouncedValue;
};

export default useDebounced;
