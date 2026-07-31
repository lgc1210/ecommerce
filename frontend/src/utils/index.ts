export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

export const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength).trim()}…`;
};

export const formatDate = (value: string) =>
	new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
