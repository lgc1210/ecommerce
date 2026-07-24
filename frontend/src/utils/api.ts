/**
 * Trích message lỗi từ response của backend để hiển thị toast.
 * Backend trả lỗi dạng { error: string } (xem auth.controller.ts / error middleware),
 * một số nơi khác có thể trả { message: string }, nên check cả hai cho an toàn.
 */
export const getApiErrorMessage = (error: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại."): string => {
	const response = (error as { response?: { data?: { error?: string; message?: string } } })?.response;
	return response?.data?.error ?? response?.data?.message ?? fallback;
};
