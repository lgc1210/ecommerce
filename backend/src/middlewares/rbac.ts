import type { Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

/**
 * Kiểm tra 1 roleId có nắm giữ permission cụ thể hay không — tách riêng khỏi middleware
 * `requirePermission` bên dưới để các service cũng gọi lại được (vd message.service.ts cần check
 * "khách của đúng hội thoại này HOẶC staff có quyền conversation:manage" — 1 route dùng chung cho
 * cả 2 phía, requirePermission chỉ check được 1 permission cố định nên không áp dụng trực tiếp lên
 * route được, phải tự check "OR" bên trong service). // MỚI — toàn bộ hàm này
 */
export const hasPermission = async (
	roleId: number,
	permissionKey: string,
): Promise<boolean> => {
	const seperatorIndex = permissionKey.indexOf(":");
	const resource =
		seperatorIndex === -1
			? permissionKey
			: permissionKey.slice(0, seperatorIndex);
	const name =
		seperatorIndex === -1
			? permissionKey
			: permissionKey.slice(seperatorIndex + 1);
	const found = await prisma.rolePermission.findFirst({
		where: { roleId, permission: { resource, name } },
	});
	return !!found;
};

/**
 * requirePermission("catalog:write") -> resource = "catalog", name = "write"
 * Quy ước: permissionKey luôn có dạng "<resource>:<name>", khớp với 2 cột
 * resource/name riêng biệt trên bảng permissions (xem rbac.seed.ts).
 *
 * BUG FIX: bản trước đây so khớp cả chuỗi "catalog:write" vào cột `name`,
 * trong khi dữ liệu thật sự lưu resource/name tách rời (vd resource="catalog",
 * name="write") -> permission không bao giờ được tìm thấy -> mọi route có
 * requirePermission() luôn trả 403, kể cả với admin.
 */
export const requirePermission = (permissionKey: string) => {
	return async (req: any, res: Response, next: NextFunction): Promise<void> => {
		try {
			const user = req.user;
			if (!user) {
				res.status(401).json({
					error: "Unauthorized: Complete session credentials not found.",
				});
				return;
			}

			// SỬA — gọi lại hasPermission() thay vì tự query prisma.rolePermission.findFirst() như trước
			if (!(await hasPermission(user.roleId, permissionKey))) {
				res.status(403).json({
					error: `Access Forbidden: You do not possess the required [${permissionKey}] permission.`,
				});
				return;
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
