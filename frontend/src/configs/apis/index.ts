import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import authService from "../../features/auth/services";
import paths from "../constants/paths";

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
	timeout: 10000,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Các endpoint tự thân liên quan tới vòng đời phiên đăng nhập -> không được
// phép trigger cơ chế tự làm mới access token (tránh vòng lặp vô hạn hoặc
// refresh nhầm khi chính request đăng nhập/đăng xuất bị 401).
const AUTH_ENDPOINTS_SKIP_REFRESH = ["/auth/login", "/auth/google", "/auth/facebook", "/auth/register", "/auth/refresh-token", "/auth/logout"];

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Gom các request bị 401 xảy ra đồng thời trong lúc đang refresh token,
// để chỉ gọi /auth/refresh-token đúng 1 lần rồi phát lại (retry) tất cả.
let isRefreshing = false;
let pendingRequests: Array<(error: unknown) => void> = [];

const flushPendingRequests = (error: unknown) => {
	pendingRequests.forEach((resolve) => resolve(error));
	pendingRequests = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as RetriableRequestConfig | undefined;
		const status = error.response?.status;
		const url = originalRequest?.url ?? "";
		const shouldSkipRefresh = AUTH_ENDPOINTS_SKIP_REFRESH.some((endpoint) => url.includes(endpoint));

		// Không phải lỗi hết hạn access token -> để nguyên cho caller tự xử lý.
		if (status !== 401 || !originalRequest || shouldSkipRefresh || originalRequest._retry) {
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		if (isRefreshing) {
			// Đã có 1 request khác đang refresh -> chờ kết quả rồi phát lại request này.
			return new Promise((resolve, reject) => {
				pendingRequests.push((refreshError) => {
					if (refreshError) reject(refreshError);
					else resolve(apiClient(originalRequest));
				});
			});
		}

		isRefreshing = true;
		try {
			// refreshToken nằm trong cookie httpOnly "refreshToken", server tự đọc
			// từ req.cookies nên không cần gửi kèm body.
			await authService.refreshToken();
			isRefreshing = false;
			flushPendingRequests(null);
			return apiClient(originalRequest);
		} catch (refreshError) {
			isRefreshing = false;
			flushPendingRequests(refreshError);

			// "/auth/me" chỉ là request DÒ trạng thái đăng nhập - mọi loader (kể cả
			// guestOnlyLoader ở các trang public như /forgot-password, /login, /register)
			// đều gọi nó để biết có đang đăng nhập hay không. 401 ở request này hoàn toàn
			// có thể là trạng thái hợp lệ (khách chưa từng đăng nhập ghé 1 trang public),
			// KHÔNG đồng nghĩa với "phiên vừa hết hạn". Nên để nguyên cho fetchCurrentUser()
			// tự bắt lỗi và trả về null (xem features/auth/hooks/useAuth.ts), rồi để đúng
			// loader (requireAuthLoader) tự quyết định redirect kèm ?from= để quay lại đúng
			// trang - thay vì hard-redirect vô điều kiện ở đây, cướp mất cả trang public.
			const isMeEndpoint = url.includes("/auth/me");

			if (!isMeEndpoint && typeof window !== "undefined" && !window.location.pathname.startsWith(paths.auth.login)) {
				window.location.assign(paths.auth.login);
			}

			return Promise.reject(refreshError);
		}
	},
);

export default apiClient;
