import { useEffect } from "react";

const SITE_NAME = "Ecommerce";
const DEFAULT_DESCRIPTION = "Khám phá sản phẩm chất lượng với trải nghiệm mua sắm đơn giản và đáng tin cậy.";

export interface SeoProps {
	title?: string;
	description?: string;
	canonicalPath?: string;
	noindex?: boolean;
	image?: string;
	type?: "website" | "product";
	jsonLd?: Record<string, unknown>;
}

const getSiteUrl = () => {
	const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
	return (configuredUrl || window.location.origin).replace(/\/$/, "");
};

const setMeta = (name: string, content: string) => {
	let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.name = name;
		document.head.appendChild(element);
	}
	element.content = content;
};

const setProperty = (property: string, content: string) => {
	let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("property", property);
		document.head.appendChild(element);
	}
	element.content = content;
};

const SeoHead = ({ title, description = DEFAULT_DESCRIPTION, canonicalPath, noindex = false, image, type = "website", jsonLd }: SeoProps) => {
	useEffect(() => {
		const siteUrl = getSiteUrl();
		const canonicalUrl = `${siteUrl}${canonicalPath ?? window.location.pathname}`;
		const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
		const imageUrl = image ? new URL(image, siteUrl).toString() : `${siteUrl}/tab-icon.svg`;

		document.title = fullTitle;
		setMeta("description", description);
		setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
		setProperty("og:title", fullTitle);
		setProperty("og:description", description);
		setProperty("og:type", type);
		setProperty("og:url", canonicalUrl);
		setProperty("og:image", imageUrl);
		setProperty("og:site_name", SITE_NAME);
		setMeta("twitter:card", "summary_large_image");
		setMeta("twitter:title", fullTitle);
		setMeta("twitter:description", description);
		setMeta("twitter:image", imageUrl);

		let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (!canonical) {
			canonical = document.createElement("link");
			canonical.rel = "canonical";
			document.head.appendChild(canonical);
		}
		canonical.href = canonicalUrl;

		const existingJsonLd = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld="true"]');
		existingJsonLd?.remove();
		if (jsonLd) {
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.dataset.seoJsonld = "true";
			script.textContent = JSON.stringify(jsonLd);
			document.head.appendChild(script);
		}
	}, [canonicalPath, description, image, jsonLd, noindex, title, type]);

	return null;
};

export default SeoHead;
