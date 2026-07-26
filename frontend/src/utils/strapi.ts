/**
 * Strapi trả URL media (ảnh/file upload) dạng đường dẫn tương đối, vd
 * "/uploads/banner_abc123.png" khi dùng local upload provider — cần nối thêm
 * gốc domain của Strapi mới dùng được trong <img src>. Nếu provider là 1 dịch
 * vụ ngoài (S3, Cloudinary...) thì Strapi đã trả sẵn URL tuyệt đối (bắt đầu
 * bằng "http"), khi đó giữ nguyên, không nối thêm domain.
 */
export const getStrapiMediaUrl = (url: string | null | undefined): string | undefined => {
	if (!url) return undefined;
	if (/^https?:\/\//i.test(url)) return url;
	return `${import.meta.env.VITE_STRAPI_BASE_URL}${url}`;
};
