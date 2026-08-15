export const reviewSort = Object.freeze({
	newest: "newest",
	oldest: "oldest",
	highest: "highest",
	lowest: "lowest",
} as const);

export type reviewSortType = (typeof reviewSort)[keyof typeof reviewSort];

export const reviewSortOptions = Object.keys(reviewSort) as reviewSortType[];
