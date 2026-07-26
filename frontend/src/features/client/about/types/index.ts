import type { BlocksContent } from "@strapi/blocks-react-renderer";

/** 1 file media (ảnh) do Strapi trả về — chỉ khai các field thực sự dùng tới. */
export interface StrapiMedia {
	id: number;
	url: string;
	alternativeText: string | null;
	width: number | null;
	height: number | null;
}

export interface AboutBreadcrumb {
	id: number;
	title: string;
	description: string;
}

export interface AboutStatItem {
	id: number;
	value: string;
	label: string;
}

export interface AboutCtaSection {
	id: number;
	title: string;
	description: string;
	btn_text: string;
}

export interface AboutStorySection {
	id: number;
	badge: string;
	title: string;
	/** Rich text dạng Strapi Blocks — render bằng <BlocksRenderer> của @strapi/blocks-react-renderer. */
	content: BlocksContent;
	btn_text: string;
	banner: StrapiMedia | null;
}

export interface AboutValueItem {
	id: number;
	/** Tên icon cấu hình ở Strapi, map sang component icon tương ứng ở frontend (xem VALUE_ICON_MAP trong about.tsx). */
	icon_name: string;
	title: string;
	description: string;
}

export interface AboutValueSection {
	id: number;
	title: string;
	description: string;
	items: AboutValueItem[];
}

/** Nội dung single type "about-page" quản lý ở Strapi (Content-Type Builder). */
export interface AboutPageData {
	id: number;
	documentId: string;
	breadcrumb: AboutBreadcrumb;
	stats_section: AboutStatItem[];
	cta_section: AboutCtaSection;
	story_section: AboutStorySection;
	value_section: AboutValueSection;
}

/** Response chuẩn của Strapi cho 1 single type: GET /api/about-page. */
export interface AboutPageResponse {
	data: AboutPageData | null;
	meta: Record<string, unknown>;
}
