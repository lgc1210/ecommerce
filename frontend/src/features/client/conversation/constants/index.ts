export const OWN_CONVERSATION_QUERY_KEY = ["client", "conversation", "me"] as const;

export const CONVERSATION_STATUS_LABEL: Record<string, string> = {
	open: "Đang mở",
	resolved: "Đã xử lý",
	closed: "Đã đóng",
};
