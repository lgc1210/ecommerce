import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import paths from "../../../../../configs/constants/paths";
import { CloseIcon, SearchIcon } from "../../../../../components/icons";
import Overlay from "../../../../../components/overlay";
import Button from "../../../../../components/button";
import FormControl from "../../../../../components/form-control";
import useDebounced from "../../../../../hooks/useDebounced";
import { useCategoryTreeQuery } from "../../../category/hooks";
import { CategoryTreeMenu, CategoryTreeMenuSkeleton } from "../category-filter";
import SearchSuggestions from "./search-suggestions";

/**
 * Ô tìm kiếm sản phẩm/danh mục trên header, cho phép người dùng tìm và nhảy thẳng tới sản phẩm/
 * danh mục mong muốn mà không cần vào trang Cửa hàng. Responsive: desktop mặc định chỉ hiện icon
 * kính lúp, bấm vào mới bung ra ô tìm kiếm nổi kèm dropdown gợi ý; mobile cũng thu gọn thành icon,
 * bấm vào mở overlay toàn màn hình (gồm ô tìm kiếm + danh mục để duyệt nhanh).
 */
const Search = () => {
	const navigate = useNavigate();

	const [query, setQuery] = useState("");
	const [desktopOpen, setDesktopOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const debouncedQuery = useDebounced(query, 350);
	const trimmedQuery = debouncedQuery.trim();
	const showSuggestions = trimmedQuery.length > 0;

	const desktopContainerRef = useRef<HTMLDivElement>(null);
	const desktopInputRef = useRef<HTMLInputElement>(null);
	const mobileInputRef = useRef<HTMLInputElement>(null);

	// Đóng ô tìm kiếm desktop (thu về icon) khi click ra ngoài, hoặc nhấn Esc.
	useEffect(() => {
		if (!desktopOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (desktopContainerRef.current && !desktopContainerRef.current.contains(event.target as Node)) setDesktopOpen(false);
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setDesktopOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [desktopOpen]);

	// Tự focus vào ô input ngay khi mở rộng ô tìm kiếm desktop hoặc overlay mobile.
	useEffect(() => {
		if (desktopOpen) desktopInputRef.current?.focus();
	}, [desktopOpen]);
	useEffect(() => {
		if (mobileOpen) mobileInputRef.current?.focus();
	}, [mobileOpen]);

	const closeAll = () => {
		setQuery("");
		setDesktopOpen(false);
		setMobileOpen(false);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = query.trim();
		if (!value) return;
		closeAll();
		navigate(`${paths.client.shop}?search=${encodeURIComponent(value)}`);
	};

	// Danh mục dùng cho phần "Duyệt theo danh mục" trong overlay mobile — chỉ fetch khi overlay mở.
	const { data: mobileCategories, isLoading: isMobileCategoriesLoading } = useCategoryTreeQuery();
	const navigateToMobileCategory = (categoryId: number) => {
		closeAll();
		navigate(`${paths.client.shop}?categoryId=${categoryId}`);
	};

	const close = () => {
		setQuery("");
		setDesktopOpen(false);
	};

	return (
		<>
			{/* Desktop: mặc định chỉ hiện icon kính lúp (không chiếm chỗ của nav); bấm vào mới bung ra ô
			    tìm kiếm dạng nổi (absolute) đè lên phía trên, không đẩy layout xung quanh. */}
			<div ref={desktopContainerRef} className='relative hidden shrink-0 lg:block'>
				{!desktopOpen && (
					<Button type='button' variant='ghost' onClick={() => setDesktopOpen(true)} aria-label='Tìm kiếm' className='size-10! rounded-full p-0!' icon={<SearchIcon className='h-5 w-5' />} />
				)}

				{desktopOpen && (
					<div className='absolute right-0 top-1/2 z-40 w-80 -translate-y-1/2 sm:w-96'>
						<form onSubmit={handleSubmit}>
							<div className='relative'>
								<SearchIcon className='pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted' />
								<FormControl
									ref={desktopInputRef}
									type='text'
									variant='surface'
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder='Tìm sản phẩm, danh mục...'
									rightElement={<Button type='button' variant='ghost' onClick={close} aria-label='Đóng tìm kiếm' className='size-7! rounded-full p-0!' icon={<CloseIcon className='h-4 w-4' />} />}
									className='rounded-full! h-10! pl-10! shadow-lg shadow-ink/5'
								/>
							</div>
						</form>

						{showSuggestions && (
							<div className='absolute right-0 top-[calc(100%+8px)] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-ink/5'>
								<SearchSuggestions query={trimmedQuery} onNavigate={closeAll} />
							</div>
						)}
					</div>
				)}
			</div>

			{/* Mobile: thu gọn thành icon, bấm vào mở overlay tìm kiếm toàn màn hình */}
			<Button
				type='button'
				variant='outline'
				onClick={() => setMobileOpen(true)}
				aria-label='Tìm kiếm'
				className='size-10! shrink-0 rounded-full p-0! lg:hidden'
				icon={<SearchIcon className='h-5 w-5' />}
			/>

			<Overlay open={mobileOpen} onClose={closeAll} />
			<div
				className={`fixed inset-x-0 top-0 z-50! flex max-h-[85vh] transform flex-col overflow-hidden bg-surface transition-transform duration-300 ease-out lg:hidden ${
					mobileOpen ? "translate-y-0" : "-translate-y-full"
				}`}>
				<form onSubmit={handleSubmit} className='flex items-center gap-2 border-b border-border p-4'>
					<div className='relative flex-1'>
						<SearchIcon className='pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted' />
						<FormControl
							ref={mobileInputRef}
							type='search'
							variant='cream'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Tìm sản phẩm, danh mục...'
							className='rounded-full! h-11! pl-10!'
						/>
					</div>
				</form>

				<div className='overflow-y-auto'>
					{showSuggestions ? (
						<SearchSuggestions query={trimmedQuery} onNavigate={closeAll} />
					) : (
						<div className='p-4'>
							<p className='px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted'>Duyệt theo danh mục</p>
							{isMobileCategoriesLoading ? (
								<CategoryTreeMenuSkeleton />
							) : mobileCategories && mobileCategories.length > 0 ? (
								<CategoryTreeMenu categories={mobileCategories} onSelect={navigateToMobileCategory} />
							) : (
								<p className='px-1 py-4 text-center text-sm text-muted'>Chưa có danh mục nào.</p>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default Search;
