export const timeAgo = (value: string) => {
	const diffMs = Date.now() - new Date(value).getTime();
	const minutes = Math.floor(diffMs / 60_000);
	if (minutes < 1) return "Vừa xong";
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.floor(hours / 24);
	return `${days} ngày trước`;
};
