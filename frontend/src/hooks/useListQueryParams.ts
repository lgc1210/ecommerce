import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useDebounced from "./useDebounced";

interface UseListQueryParamsOptions {
	/** Phải khớp với `defaultLimit` truyền cho <Pagination> ở cùng trang, nếu có dùng Pagination. */
	defaultLimit?: number;
	/** Độ trễ debounce cho ô search trước khi đồng bộ vào URL (ms). Mặc định 400ms. */
	searchDebounceMs?: number;
}

/**
 * Gom logic đọc/ghi `page` + `limit` + `search` qua URL query params — dùng chung cho các trang
 * danh sách trong admin (product, category, coupon, contact, user...). Chỉ xử lý phần CHUNG
 * (page/limit/search); filter riêng của từng trang (categoryId, isActive, sort, status...) dùng
 * `setFilter(key, value)` trả về từ hook này, không cần khai báo thêm state riêng.
 *
 * Lưu ý về phạm vi state: toàn bộ state này sống trong URL + React state của TAB trình duyệt
 * hiện tại — mỗi người dùng có 1 bản hoàn toàn độc lập (khác iframe/process JS), không có khái
 * niệm "2 user cùng sửa 1 state" ở đây như với dữ liệu server/database.
 *
 * Có 1 giới hạn cần biết: nếu 1 TRANG render từ 2 danh sách phân trang trở lên và cả 2 đều gọi
 * hook này, chúng sẽ tranh nhau cùng 1 param `page`/`search` trên URL (đổi trang bảng này sẽ vô
 * tình đổi luôn "trang" của bảng kia). Hiện tại chưa cần vì mỗi trang admin chỉ có 1 danh sách,
 * nhưng nếu phát sinh case đó thì cần thêm tham số `paramPrefix` để mỗi lần dùng hook có bộ
 * key riêng (`page_orders`, `page_reviews`...) — chưa triển khai ở bản này.
 */
const useListQueryParams = ({ defaultLimit, searchDebounceMs = 400 }: UseListQueryParamsOptions = {}) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || defaultLimit;
	const search = searchParams.get("search") ?? "";

	const [searchInput, setSearchInput] = useState(search);
	const debouncedSearch = useDebounced(searchInput, searchDebounceMs);

	useEffect(() => {
		const currentSearchInUrl = searchParams.get("search") ?? "";
		if (debouncedSearch === currentSearchInUrl) return;

		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (debouncedSearch.trim()) next.set("search", debouncedSearch.trim());
				else next.delete("search");
				next.delete("page");
				return next;
			},
			{ replace: true },
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch]);

	/** Set (hoặc xoá nếu value=undefined) 1 filter tuỳ ý trên URL, luôn kèm reset về trang 1. */
	const setFilter = (key: string, value: string | undefined) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value === undefined) next.delete(key);
				else next.set(key, value);
				next.delete("page");
				return next;
			},
			{ replace: true },
		);
	};

	/** Xoá toàn bộ query params (search + mọi filter riêng của trang), về lại trạng thái ban đầu. */
	const clearFilters = () => {
		setSearchInput("");
		setSearchParams({}, { replace: true });
	};

	/** true nếu đang có search hoặc bất kỳ filter riêng nào (truyền tên các key filter riêng của trang). */
	const hasActiveFilters = (extraFilterKeys: string[] = []) => {
		if (search) return true;
		return extraFilterKeys.some((key) => searchParams.get(key) !== null);
	};

	return {
		searchParams,
		setSearchParams,
		page,
		limit,
		search,
		searchInput,
		setSearchInput,
		setFilter,
		clearFilters,
		hasActiveFilters,
	};
};

export default useListQueryParams;
