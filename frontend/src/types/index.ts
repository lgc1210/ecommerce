export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface RouteHandle {
	title?: string;
	description?: string;
	seo?: {
		description?: string;
		noindex?: boolean;
	};
	crumb?: () => string;
	crumbPath?: string;
	preventScrollReset?: boolean;
}
