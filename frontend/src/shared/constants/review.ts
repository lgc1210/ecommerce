export const REVIEW_SORT_LABEL = Object.freeze({
	newest: "Mới nhất",
	oldest: "Cũ nhất",
	highest: "Điểm cao nhất",
	lowest: "Điểm thấp nhất",
} as const);

export type ReviewSort = keyof typeof REVIEW_SORT_LABEL;
