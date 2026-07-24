import type { Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

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
	const separatorIndex = permissionKey.indexOf(":");
	const resource = separatorIndex === -1 ? permissionKey : permissionKey.slice(0, separatorIndex);
	const name = separatorIndex === -1 ? permissionKey : permissionKey.slice(separatorIndex + 1);

	return async (req: any, res: Response, next: NextFunction): Promise<void> => {
		try {
			const user = req.user;
			if (!user) {
				res.status(401).json({ error: "Unauthorized: Complete session credentials not found." });
				return;
			}

			// Query database to verify if this specific roleId holds the requested permission mapping
			const hasPermission = await prisma.rolePermission.findFirst({
				where: {
					roleId: user.roleId,
					permission: {
						resource,
						name,
					},
				},
			});

			if (!hasPermission) {
				res.status(403).json({ error: `Access Forbidden: You do not possess the required [${permissionKey}] permission.` });
				return;
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
