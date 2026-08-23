/** Số ngày kể từ khi đơn hàng "delivered" mà user còn được phép viết đánh giá — phải khớp REVIEW_ELIGIBLE_WINDOW_DAYS ở backend. */
export const REVIEW_ELIGIBLE_WINDOW_DAYS = 30;

/** Số ngày còn lại để đánh giá (làm tròn xuống), tối thiểu 0. Trả về null nếu chưa có mốc giao hàng. */
export function getReviewDaysRemaining(deliveredAt: string | null): number | null {
	if (!deliveredAt) return null;
	const deadline = new Date(deliveredAt).getTime() + REVIEW_ELIGIBLE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
	const remainingMs = deadline - Date.now();
	return Math.max(0, Math.floor(remainingMs / (24 * 60 * 60 * 1000)));
}
