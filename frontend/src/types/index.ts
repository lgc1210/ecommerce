export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface RouteHandle {
	title?: string;
	crumb?: () => string;
	crumbPath?: string;
	preventScrollReset?: boolean;
}
