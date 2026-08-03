import type { BlocksContent } from "@strapi/blocks-react-renderer";

/** 1 file media (ảnh) do Strapi trả về — chỉ khai các field thực sự dùng tới. */
export interface StrapiMedia {
	id: number;
	url: string;
	alternativeText: string | null;
	width: number | null;
	height: number | null;
}

export interface HomeHeroSection {
	id: number;
	badge: string;
	title: string;
	/** Rich text dạng Strapi Blocks — render bằng <BlocksRenderer> của @strapi/blocks-react-renderer. */
	content: BlocksContent;
	banner: StrapiMedia | null;
	btn_text: string;
	btn_second_text: string;
}

export interface HomeValueItem {
	id: number;
	/** Tên icon cấu hình ở Strapi, map sang component icon tương ứng ở frontend (xem VALUE_ICON_MAP trong Home.tsx). */
	icon_name: string;
	title: string;
	description: string;
}

/** Nội dung single type "home" quản lý ở Strapi (Content-Type Builder). */
export interface HomePageData {
	id: number;
	documentId: string;
	hero_section: HomeHeroSection;
	value_item: HomeValueItem[];
}

/** Response chuẩn của Strapi cho 1 single type: GET /api/home. */
export interface HomePageResponse {
	data: HomePageData | null;
	meta: Record<string, unknown>;
}
