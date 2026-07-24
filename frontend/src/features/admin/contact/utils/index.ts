import type { ContactStatus } from "../types";

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
	new: "Mới",
	in_progress: "Đang xử lý",
	resolved: "Đã giải quyết",
	closed: "Đã đóng",
};

export const CONTACT_STATUS_BADGE_CLASSNAME: Record<ContactStatus, string> = {
	new: "bg-blue-50 text-blue-600",
	in_progress: "bg-amber-50 text-amber-600",
	resolved: "bg-primary-light text-primary-dark",
	closed: "bg-ink/10 text-ink/60",
};

/**
 * Mirror của ALLOWED_TRANSITIONS ở backend (contact.utils.ts) — chỉ dùng để giới
 * hạn option hiển thị trong dropdown đổi trạng thái cho gọn UX (ẩn bớt bước
 * chuyển vô nghĩa). Backend vẫn là nơi validate thật sự, FE không tự ý tin
 * tưởng 100% để tránh lệch logic nếu 2 bên không đồng bộ.
 */
const ALLOWED_TRANSITIONS: Record<ContactStatus, ContactStatus[]> = {
	new: ["in_progress", "resolved", "closed"],
	in_progress: ["resolved", "closed", "new"],
	resolved: ["closed", "in_progress"],
	closed: ["in_progress"],
};

export const getNextContactStatusOptions = (current: ContactStatus): ContactStatus[] => [
	current,
	...ALLOWED_TRANSITIONS[current],
];
