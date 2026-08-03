import strapiClient from "../../../../configs/apis/strapi";
import type { HomePageResponse } from "../types";

const homeService = {
	/** Home information single type "home" trên Strapi. */
	getPage: () =>
		strapiClient.get<HomePageResponse>("/home", {
			params: {
				// Populate lồng trong Strapi phải khai theo dạng MẢNG index (populate[field][populate][0]=...),
				// không phải object key (populate[field][populate][x]=*) — dạng object key bị Strapi trả 400.
				"populate[hero_section][populate][0]": "banner",
				// value_item là component lặp lại (repeatable) chỉ có field phẳng (icon_name/title/
				// description), KHÔNG có quan hệ lồng nào cần populate riêng -> dùng "*" là đủ.
				"populate[value_item]": "*",
			},
		}),
};

export default homeService;
