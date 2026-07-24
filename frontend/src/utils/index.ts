export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

export const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength).trim()}…`;
};
