import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRightIcon } from "../../components/icons";
import Button from "../../components/button";

interface CarouselProps<T> {
	items: T[];
	renderItem: (item: T, index: number) => ReactNode;
	/** Khoá duy nhất cho mỗi item, dùng làm key. */
	getKey: (item: T, index: number) => string | number;
	/** Thời gian tự động chuyển slide (ms). Truyền 0 để tắt auto-play. Mặc định 5000ms. */
	autoPlayInterval?: number;
	className?: string;
}

// Trùng breakpoint "sm" của Tailwind (640px) - phải khớp với class w-full sm:w-1/2 của item bên dưới:
// từ breakpoint này trở lên hiển thị 2 item/lần, dưới đó hiển thị 1 item/lần.
const DESKTOP_QUERY = "(min-width: 640px)";

/** Số item hiển thị cùng lúc theo kích thước màn hình: 2 ở desktop (>=640px), 1 ở mobile. */
function useItemsPerView(): number {
	const [isDesktop, setIsDesktop] = useState(() => (typeof window !== "undefined" ? window.matchMedia(DESKTOP_QUERY).matches : false));

	useEffect(() => {
		const mediaQuery = window.matchMedia(DESKTOP_QUERY);
		const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return isDesktop ? 2 : 1;
}

/**
 * Carousel tối giản: hiển thị 2 item/lần ở desktop, 1 item/lần ở mobile (trượt từng item một, không
 * theo trang), tự động chuyển sau autoPlayInterval, dừng khi hover. Dùng transform trên track thay vì
 * thư viện ngoài (project chưa có carousel lib nào - xem YAGNI).
 */
function Carousel<T>({ items, renderItem, getKey, autoPlayInterval = 5000, className = "" }: CarouselProps<T>) {
	const itemsPerView = useItemsPerView();
	// Chỉ số slide cuối cùng còn hợp lệ - để item cuối khớp đúng mép phải, không chừa khoảng trống khi
	// hiển thị nhiều hơn 1 item/lần. slideCount = số vị trí trượt hợp lệ (0..maxIndex).
	const maxIndex = Math.max(items.length - itemsPerView, 0);
	const slideCount = maxIndex + 1;

	const [rawIndex, setRawIndex] = useState(0);
	const [isHovering, setIsHovering] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Tính trực tiếp lúc render thay vì dùng 1 effect riêng để "reset" activeIndex khi items.length/
	// itemsPerView đổi (vd. đổi breakpoint hoặc data mới tải xong) - tránh setState đồng bộ trong effect,
	// xem https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
	const activeIndex = Math.min(rawIndex, maxIndex);

	useEffect(() => {
		if (!autoPlayInterval || slideCount <= 1 || isHovering) return;

		timerRef.current = setInterval(() => {
			setRawIndex((current) => (Math.min(current, maxIndex) + 1) % slideCount);
		}, autoPlayInterval);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [autoPlayInterval, slideCount, maxIndex, isHovering]);

	if (items.length === 0) return null;

	const goTo = (index: number) => setRawIndex(((index % slideCount) + slideCount) % slideCount);

	return (
		<div className={`relative group ${className}`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
			<div className='overflow-hidden rounded-3xl'>
				<div className='flex -mx-2 transition-transform duration-500 ease-out' style={{ transform: `translateX(-${activeIndex * (100 / itemsPerView)}%)` }}>
					{items.map((item, index) => (
						<div key={getKey(item, index)} className='w-full shrink-0 px-2 sm:w-1/2'>
							{renderItem(item, index)}
						</div>
					))}
				</div>
			</div>

			{slideCount > 1 && (
				<>
					<Button
						type='button'
						variant='primary'
						size='sm'
						aria-label='Slide trước'
						onClick={() => goTo(activeIndex - 1)}
						className='absolute left-3 top-1/2 -translate-y-1/2 p-2.5! opacity-20 group-hover:opacity-100 bg-cream/90! text-ink! shadow-md! hover:bg-cream! transition-all!'>
						<ChevronRightIcon className='h-4 w-4 rotate-180' />
					</Button>
					<Button
						type='button'
						variant='primary'
						size='sm'
						aria-label='Slide tiếp theo'
						onClick={() => goTo(activeIndex + 1)}
						className='absolute right-3 top-1/2 -translate-y-1/2 p-2.5! opacity-20 group-hover:opacity-100 bg-cream/90! text-ink! shadow-md! hover:bg-cream! transition-all!'>
						<ChevronRightIcon className='h-4 w-4' />
					</Button>

					<div className='mt-4 flex items-center justify-center gap-2'>
						{Array.from({ length: slideCount }).map((_, index) => (
							<Button
								key={index}
								type='button'
								aria-label={`Đến slide ${index + 1}`}
								onClick={() => goTo(index)}
								className={`p-0! h-2! rounded-full transition-all! ${index === activeIndex ? "w-6! bg-primary!" : "w-2! bg-ink/20! hover:bg-ink/4!"}`}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

export default Carousel;
