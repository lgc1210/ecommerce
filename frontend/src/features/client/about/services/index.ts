import strapiClient from "../../../../configs/apis/strapi";
import type { AboutPageResponse } from "../types";

const aboutService = {
	/** About information single type "about-page" trên Strapi. */
	getPage: () =>
		strapiClient.get<AboutPageResponse>("/about-page", {
			params: {
				// Populate lồng trong Strapi phải khai theo dạng MẢNG index (populate[field][populate][0]=...),
				// không phải object key (populate[field][populate][x]=*) — dạng object key bị Strapi trả 400.
				"populate[breadcrumb]": "*",
				"populate[stats_section]": "*",
				"populate[cta_section]": "*",
				"populate[story_section][populate][0]": "banner",
				"populate[value_section][populate][0]": "items",
			},
		}),
};

export default aboutService;
