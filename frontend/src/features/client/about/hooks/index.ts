import { useQuery } from "@tanstack/react-query";
import aboutService from "../services";
import type { AboutPageResponse } from "../types";

export const ABOUT_PAGE_QUERY_KEY = ["client", "about", "page"] as const;

/** Toàn bộ nội dung trang Giới thiệu, lấy từ Strapi (CMS quản lý nội dung động). */
export const useAboutPageQuery = () => {
	return useQuery<AboutPageResponse>({
		queryKey: ABOUT_PAGE_QUERY_KEY,
		queryFn: async () => {
			const res = await aboutService.getPage();
			return res.data;
		},
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
};
