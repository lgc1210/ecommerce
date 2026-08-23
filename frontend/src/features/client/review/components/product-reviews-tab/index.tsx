import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { PublicReview } from "../../types";
import { REVIEW_SORT_LABEL, type ReviewSort } from "../../../../../shared/constants/review";
import { useReviewsByProductQuery } from "../../hooks";
import ProductReviewsTabSkeleton from "./skeleton";
import StarRating from "../star-rating";
import FormSelect from "../../../../../components/form-select";
import ReviewCard from "../review-card";

const PAGE_SIZE = 10;
/** Khớp hash `#review-{id}` mà notification "shop phản hồi" build ra — xem buildReviewRepliedNotification ở backend. */
const REVIEW_HASH_PATTERN = /^#review-(\d+)$/;
/** Thời gian giữ viền highlight trước khi tự tắt, tính từ lúc review được tìm thấy và cuộn tới. */
const HIGHLIGHT_DURATION_MS = 3000;
// Tham chiếu cố định (không phải `[]` literal) khi chưa có data — tránh logic bên dưới nghĩ
// "reviews" đổi giá trị ở MỌI lần render (mảng literal mới luôn !== mảng literal cũ dù cùng rỗng).
const EMPTY_REVIEWS: PublicReview[] = [];

interface ProductReviewsTabProps {
	productId: number;
}

/** Nội dung tab "Đánh giá" ở trang chi tiết sản phẩm — chỉ gồm review công khai (isVisible=true). */
const ProductReviewsTab = ({ productId }: ProductReviewsTabProps) => {
	const { hash } = useLocation();
	const highlightReviewId = Number(hash.match(REVIEW_HASH_PATTERN)?.[1]) || undefined;
	// Lưu ID review LẦN GẦN NHẤT đã tự highlight (không phải boolean) — để nếu khách bấm 2 thông
	// báo review-reply KHÁC NHAU liên tiếp cho cùng 1 sản phẩm (không rời trang, component không
	// remount), mỗi highlightReviewId mới vẫn được xử lý đúng 1 lần, thay vì bị 1 cờ chặn hết.
	// Dùng useState (không phải useRef) vì cần ĐỌC/GHI trong lúc render — ref không được phép truy
	// cập lúc render (rule react-hooks/refs); cùng pattern với "syncedSlug" ở product-detail page.
	const [handledId, setHandledId] = useState<number | undefined>(undefined);
	// State RIÊNG cho việc hiển thị viền highlight (khác `highlightReviewId` đọc thẳng từ hash) —
	// `highlightReviewId` tồn tại mãi cho tới khi URL đổi, còn viền chỉ nên hiện tạm thời rồi tự tắt.
	const [activeHighlightId, setActiveHighlightId] = useState<number | undefined>(undefined);

	const [page, setPage] = useState(1);
	const [rating, setRating] = useState<number | undefined>(undefined);
	const [sort, setSort] = useState<ReviewSort>(Object.keys(REVIEW_SORT_LABEL)[0] as ReviewSort);

	const { data, isLoading } = useReviewsByProductQuery(productId, { page, limit: PAGE_SIZE, rating, sort });
	const reviews = data?.data ?? EMPTY_REVIEWS;
	const summary = data?.summary;

	// "Điều chỉnh state khi render" (không dùng useEffect) để phát hiện đúng thời điểm review cần
	// highlight đã xuất hiện trong dữ liệu vừa tải — cùng pattern với "syncedSlug" ở product-detail
	// page. Việc CUỘN và HẸN GIỜ TẮT (side effect thật sự, đụng tới DOM/timer) nằm ở useEffect bên
	// dưới, kích hoạt khi activeHighlightId đổi.
	if (highlightReviewId && handledId !== highlightReviewId && reviews.some((r) => r.id === highlightReviewId)) {
		setHandledId(highlightReviewId);
		setActiveHighlightId(highlightReviewId);
	}

	useEffect(() => {
		if (activeHighlightId === undefined) return;
		// Đợi 1 nhịp cho DOM render xong review vừa lọc/thêm vào trước khi cuộn.
		const raf = requestAnimationFrame(() => {
			document.getElementById(`review-${activeHighlightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
		});
		const timeoutId = setTimeout(() => setActiveHighlightId(undefined), HIGHLIGHT_DURATION_MS);
		// Cleanup chạy cả khi activeHighlightId đổi sang ID khác lẫn khi unmount — không cần effect
		// riêng cho unmount hay ref lưu timeout thủ công.
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timeoutId);
		};
	}, [activeHighlightId]);

	const handleFilterRating = (nextRating: number | undefined) => {
		setRating(nextRating);
		setPage(1);
	};

	if (isLoading) return <ProductReviewsTabSkeleton />;

	return (
		<div className='max-w-3xl'>
			{/* Tổng hợp điểm đánh giá */}
			{summary && summary.total > 0 && (
				<div className='mb-6 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-cream-soft/60 p-5'>
					<div className='text-center'>
						<p className='text-3xl font-extrabold text-ink'>{summary.average?.toFixed(1) ?? "—"}</p>
						<StarRating rating={summary.average ?? 0} size='sm' className='mt-1 justify-center' />
						<p className='mt-1 text-xs text-muted'>{summary.total} đánh giá</p>
					</div>
					<div className='flex-1 min-w-48 space-y-1'>
						{([5, 4, 3, 2, 1] as const).map((star) => {
							const count = summary.breakdown[star];
							const percent = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
							return (
								<button
									key={star}
									type='button'
									onClick={() => handleFilterRating(rating === star ? undefined : star)}
									className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-0.5 text-xs transition-colors hover:bg-cream-soft ${rating === star ? "bg-cream-soft" : ""}`}>
									<span className='w-8 shrink-0 text-ink/70'>{star} sao</span>
									<span className='h-1.5 flex-1 overflow-hidden rounded-full bg-border'>
										<span className='block h-full rounded-full bg-primary' style={{ width: `${percent}%` }} />
									</span>
									<span className='w-6 shrink-0 text-right text-muted'>{count}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Filter đang áp dụng + sắp xếp */}
			{summary && summary.total > 0 && (
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					{rating ? (
						<button type='button' onClick={() => handleFilterRating(undefined)} className='text-xs font-medium text-primary-dark hover:underline'>
							Đang lọc {rating} sao · Bỏ lọc
						</button>
					) : (
						<span />
					)}
					<FormSelect
						size='sm'
						value={sort}
						onChange={(e) => {
							setSort(e.target.value as ReviewSort);
							setPage(1);
						}}
						options={Object.entries(REVIEW_SORT_LABEL).map(([value, label]) => ({ value, label }))}
					/>
				</div>
			)}

			{/* Danh sách review */}
			{reviews.length > 0 ? (
				<ul className='space-y-6'>
					{reviews.map((review) => (
						<ReviewCard key={review.id} review={review} isHighlighted={review.id === activeHighlightId} />
					))}
				</ul>
			) : (
				<p className='text-muted'>{rating ? `Chưa có đánh giá ${rating} sao nào.` : "Sản phẩm này chưa có đánh giá nào."}</p>
			)}

			{data && data.pagination.total > PAGE_SIZE && (
				<div className='mt-6'>
					<PageControls page={page} limit={PAGE_SIZE} total={data.pagination.total} onChange={setPage} />
				</div>
			)}
		</div>
	);
};

/**
 * <Pagination> dùng chung của app đọc/ghi "page" thẳng lên URL query string — không phù hợp ở đây
 * vì trang chi tiết sản phẩm không nên đổi URL chỉ vì lật trang review (và có thể đụng query khác
 * của trang trong tương lai). Nên dùng state cục bộ + UI tối giản riêng cho tab này.
 */
const PageControls = ({ page, limit, total, onChange }: { page: number; limit: number; total: number; onChange: (page: number) => void }) => {
	const totalPages = Math.max(1, Math.ceil(total / limit));
	return (
		<div className='flex items-center justify-center gap-3 text-sm'>
			<button type='button' disabled={page <= 1} onClick={() => onChange(page - 1)} className='rounded-lg px-3 py-1.5 text-ink/70 hover:bg-cream-soft disabled:opacity-40'>
				Trước
			</button>
			<span className='text-ink/70'>
				Trang {page}/{totalPages}
			</span>
			<button type='button' disabled={page >= totalPages} onClick={() => onChange(page + 1)} className='rounded-lg px-3 py-1.5 text-ink/70 hover:bg-cream-soft disabled:opacity-40'>
				Sau
			</button>
		</div>
	);
};

export default ProductReviewsTab;
