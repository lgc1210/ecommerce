import { useSearchParams } from "react-router-dom";
import FormSelect from "./form-select";
import { ChevronRightIcon } from "./icons";
import Button from "./button";

interface PaginationProps {
	/** Tổng số bản ghi (không phải số trang) — component tự tính totalPages từ total/limit. */
	total: number;
	/** Lựa chọn cho dropdown "Hiển thị x / trang". Truyền mảng rỗng để ẩn hẳn dropdown này. */
	pageSizeOptions?: number[];
	/** limit mặc định khi URL chưa có ?limit=. Phải khớp với giá trị mặc định nơi gọi API. */
	defaultLimit?: number;
	/** Disable các control trong lúc đang fetch, tránh bấm dồn dập đổi trang/limit liên tục. */
	isLoading?: boolean;
}

const getPageList = (current: number, total: number): (number | "ellipsis")[] => {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const pages = new Set<number>([1, total, current, current - 1, current + 1]);
	const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

	const result: (number | "ellipsis")[] = [];
	sorted.forEach((page, i) => {
		if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis");
		result.push(page);
	});
	return result;
};

/**
 * Pagination tự đọc/ghi "page" và "limit" thẳng lên URL query string qua
 * useSearchParams. Nơi gọi (vd. UserPage) CHỈ cần truyền `total`, không cần tự
 * giữ state `page`/`limit` hay truyền `onPageChange` xuống nữa — vì cả
 * Pagination lẫn hook gọi API ở trang cha đều đọc "page"/"limit" trực tiếp từ
 * cùng 1 URL, nên tự động đồng bộ với nhau mà không cần nối prop qua lại.
 *
 * Lưu ý cho nơi gọi: phải tự đọc "limit" từ URL (cùng `defaultLimit` truyền
 * vào đây) để dùng cho query API, thay vì hard-code 1 hằng số riêng — nếu
 * không, đổi dropdown "Hiển thị x/trang" ở đây sẽ không khớp với data thực tế
 * được fetch.
 */
const Pagination = ({
	total,
	pageSizeOptions = [10, 20, 50],
	defaultLimit = 10,
	isLoading = false,
}: PaginationProps) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || defaultLimit;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
	const rangeEnd = Math.min(page * limit, total);

	const goToPage = (nextPage: number) => {
		if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("page", String(nextPage));
				return next;
			},
			{ replace: true },
		);
	};

	const changeLimit = (nextLimit: number) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("limit", String(nextLimit));
				next.delete("page"); // đổi số lượng/trang thì luôn quay về trang 1
				return next;
			},
			{ replace: true },
		);
	};

	if (total === 0) return null;

	return (
		<div className='flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row'>
			<div className='flex items-center gap-4'>
				{pageSizeOptions.length > 0 && (
					<>
						<label className='flex items-center gap-2 text-sm text-muted'>
							<span>Hiển thị</span>
							<FormSelect
								size='sm'
								value={limit}
								disabled={isLoading}
								onChange={(e) => changeLimit(Number(e.target.value))}
								options={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))}
							/>
							<span>/ trang</span>
						</label>

						<span className='hidden h-4 w-px bg-border sm:block' />
					</>
				)}

				<small className='text-xs text-muted'>
					{rangeStart}–{rangeEnd} trong tổng số <span className='font-semibold text-ink'>{total}</span>
				</small>
			</div>

			<nav className='flex items-center gap-1.5' aria-label='Pagination'>
				<Button
					type='button'
					variant='outline'
					disabled={page === 1 || isLoading}
					onClick={() => goToPage(page - 1)}
					aria-label='Trang trước'
					title='Trang trước'
					icon={<ChevronRightIcon className='h-4 w-4 rotate-180' />}
					className='px-3.5!'
				/>
				{getPageList(page, totalPages).map((p, index) =>
					p === "ellipsis" ? (
						<span key={`ellipsis-${index}`} className='px-1 text-muted'>
							…
						</span>
					) : (
						<Button
							key={p}
							type='button'
							variant={p === page ? "primary" : "ghost"}
							disabled={isLoading}
							onClick={() => goToPage(p)}
							className='px-4.5!'>
							{p}
						</Button>
					),
				)}
				<Button
					type='button'
					variant='outline'
					disabled={page === totalPages || isLoading}
					onClick={() => goToPage(page + 1)}
					aria-label='Trang sau'
					title='Trang sau'
					icon={<ChevronRightIcon className='h-4 w-4' />}
					className='px-3.5!'
				/>
			</nav>
		</div>
	);
};

export default Pagination;
