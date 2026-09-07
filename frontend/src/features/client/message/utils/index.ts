/** Định dạng giờ ngắn gọn cho từng tin nhắn (vd "14:05"). */
export const formatMessageTime = (value: string): string => {
	return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};
