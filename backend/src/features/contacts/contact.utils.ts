export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

/**
 * Các bước chuyển trạng thái hợp lệ cho 1 liên hệ. "closed" là trạng thái cuối
 * nhưng vẫn cho phép mở lại (-> in_progress) nếu khách phản hồi thêm sau khi đã đóng.
 */
const ALLOWED_TRANSITIONS: Record<ContactStatus, ContactStatus[]> = {
	new: ["in_progress", "resolved", "closed"],
	in_progress: ["resolved", "closed", "new"],
	resolved: ["closed", "in_progress"],
	closed: ["in_progress"],
};

/** Kiểm tra việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không */
export function isValidContactStatusTransition(current: ContactStatus, next: ContactStatus): boolean {
	if (current === next) return true;
	return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}
