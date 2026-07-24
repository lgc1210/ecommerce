import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import queryClient from "../../../configs/query-client";
import paths from "../../../configs/constants/paths";
import { AUTH_ME_QUERY_KEY, fetchCurrentUser, type AuthUser } from "../hooks/useAuth";

/**
 * Lấy user hiện tại thông qua cache của react-query thay vì gọi thẳng authService.me().
 * queryClient.fetchQuery sẽ:
 * - Trả ngay data trong cache nếu còn "fresh" (staleTime), không gọi lại API.
 * - Tự động gọi lại /auth/me nếu cache đã stale hoặc chưa có.
 * Nhờ vậy khi user điều hướng qua lại giữa nhiều route được bảo vệ, ta không
 * gọi lại /auth/me liên tục ở mỗi lần loader chạy.
 *
 * Export ra ngoài để middlewares/rbac.ts (requirePermissionLoader) dùng lại,
 * tránh phải viết thêm một bản fetchQuery thứ hai cho cùng 1 cache key.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
	return queryClient.fetchQuery({
		queryKey: AUTH_ME_QUERY_KEY,
		queryFn: fetchCurrentUser,
	});
}

/**
 * Dùng cho các route bắt buộc đăng nhập (vd. /order, trang thông tin cá nhân...).
 * Nếu chưa đăng nhập -> redirect về /login kèm query "from" để sau khi đăng nhập
 * thành công có thể điều hướng người dùng quay lại đúng trang họ đang muốn vào.
 *
 * Chỉ kiểm tra "đã đăng nhập hay chưa". Với các route cần thêm điều kiện về
 * permission cụ thể (vd. toàn bộ khu vực /admin), dùng requirePermissionLoader
 * trong middlewares/rbac.ts thay vì loader này.
 */
export const requireAuthLoader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getCurrentUser();

	if (!user) {
		const from = new URL(request.url).pathname;
		throw redirect(`${paths.auth.login}?from=${encodeURIComponent(from)}`);
	}

	return { user };
};

/**
 * Dùng cho các route chỉ dành cho khách chưa đăng nhập (login, register, forgot-password).
 * Nếu đã đăng nhập rồi mà cố vào lại /login -> điều hướng thẳng về trang chủ.
 */
export const guestOnlyLoader = async () => {
	const user = await getCurrentUser();

	if (user) {
		throw redirect(paths.client.home);
	}

	return null;
};
