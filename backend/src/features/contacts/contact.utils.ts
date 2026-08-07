import { ContactStatus } from "../../generated/prisma/index.js";

/**
 * Các bước chuyển trạng thái hợp lệ cho 1 liên hệ. "closed" là trạng thái cuối
 * nhưng vẫn cho phép mở lại (-> in_progress) nếu khách phản hồi thêm sau khi đã đóng.
 */
const ALLOWED_TRANSITIONS: Record<ContactStatus, ContactStatus[]> = {
	new: [ContactStatus.in_progress, ContactStatus.resolved, ContactStatus.closed],
	in_progress: [ContactStatus.resolved, ContactStatus.closed, ContactStatus.new],
	resolved: [ContactStatus.closed, ContactStatus.in_progress],
	closed: [ContactStatus.in_progress],
};

/** Kiểm tra việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không */
export function isValidContactStatusTransition(current: ContactStatus, next: ContactStatus): boolean {
	if (current === next) return true;
	return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}
