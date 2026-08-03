import { useQuery } from "@tanstack/react-query";
import homeService from "../services";
import type { HomePageResponse } from "../types";

export const HOME_PAGE_QUERY_KEY = ["client", "home", "page"] as const;

/** Toàn bộ nội dung trang Giới thiệu, lấy từ Strapi (CMS quản lý nội dung động). */
export const useHomePageQuery = () => {
	return useQuery<HomePageResponse>({
		queryKey: HOME_PAGE_QUERY_KEY,
		queryFn: async () => {
			const res = await homeService.getPage();
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
};
