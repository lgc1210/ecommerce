import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import paths from "../configs/constants/paths";
import { getCurrentUser } from "../features/auth/loader";
import type { AuthUser } from "../features/auth/hooks/useAuth";

/**
 * Kiểm tra user hiện tại có permission "resource:name" hay không (vd. "catalog:write").
 * Dùng ở component-level để ẩn/hiện nút, hành động (vd. nút "Xoá sản phẩm" chỉ hiện
 * với ai có "catalog:write"), song song với route guard (requirePermissionLoader).
 */
export const hasPermission = (user: AuthUser | null | undefined, permissionKey: string): boolean => {
	if (!user) return false;
	return user.permissions.includes(permissionKey);
};

/** True nếu user có ít nhất 1 trong các permission truyền vào. */
export const hasAnyPermission = (user: AuthUser | null | undefined, permissionKeys: string[]): boolean => {
	if (!user) return false;
	return permissionKeys.some((key) => user.permissions.includes(key));
};

/**
 * Loader factory cho react-router: chặn vào route nếu user hiện tại không có
 * permissionKey yêu cầu (vd. requirePermissionLoader("catalog:write") cho route
 * quản lý sản phẩm). Tự kiểm tra luôn trạng thái đăng nhập, nên mỗi route admin
 * chỉ cần khai báo 1 loader duy nhất, không cần lồng thêm requireAuthLoader.
 *
 * Chưa đăng nhập -> redirect /login kèm "from" để quay lại đúng trang sau khi login.
 * Đã đăng nhập nhưng thiếu quyền -> redirect /403 (khác /login, vì đây là vấn đề
 * phân quyền chứ không phải phiên đăng nhập).
 */
export const requirePermissionLoader = (permissionKey: string) => {
	return async ({ request }: LoaderFunctionArgs) => {
		const user = await getCurrentUser();

		if (!user) {
			const from = new URL(request.url).pathname;
			throw redirect(`${paths.auth.login}?from=${encodeURIComponent(from)}`);
		}

		if (!hasPermission(user, permissionKey)) {
			throw redirect(paths.errors.forbidden);
		}

		return { user };
	};
};
