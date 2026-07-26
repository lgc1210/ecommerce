import axios from "axios";

/**
 * Instance axios riêng để gọi Strapi CMS — KHÔNG dùng chung `apiClient` ở
 * `configs/apis/index.ts` vì đó là client trỏ tới backend chính của app
 * (VITE_API_BASE_URL, có interceptor tự refresh access token bằng cookie
 * httpOnly của hệ thống auth riêng). Strapi là 1 service độc lập, không chia
 * sẻ cơ chế auth đó, nên tách hẳn 1 client khác để tránh nhầm lẫn/side-effect.
 *
 * baseURL trỏ thẳng vào REST API mặc định của Strapi (`/api`), nên các service
 * gọi `strapiClient.get("/about-banner")` là đủ, không cần lặp lại "/api".
 */
const strapiClient = axios.create({
	baseURL: `${import.meta.env.VITE_STRAPI_BASE_URL}/api`,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export default strapiClient;
