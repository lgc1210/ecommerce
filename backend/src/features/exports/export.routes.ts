import { Router } from "express";
import type { NextFunction, Response } from "express";
import { authenticateJWT, type AuthenticatedRequest } from "../../middlewares/authenticate.js";
import { hasPermission } from "../../middlewares/rbac.js";
import { validate } from "../../middlewares/validate.js";
import { exportAdminResource } from "./export.controller.js";
import { ExportQuerySchema, type ExportResource } from "./export.validation.js";

const permissions: Record<ExportResource, string> = {
	users: "user:read",
	categories: "catalog:read",
	products: "catalog:read",
	coupons: "coupon:manage",
	reviews: "review:update",
	contacts: "contact:manage",
	orders: "order:update",
	payments: "payment:read",
};

const requireExportPermission = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const permission = permissions[req.params.resource as ExportResource];
		if (!permission || !req.user || !(await hasPermission(req.user.roleId, permission))) {
			res.status(403).json({ error: "Access Forbidden: bạn không có quyền xuất dữ liệu này." });
			return;
		}
		next();
	} catch (error) {
		next(error);
	}
};

const router = Router();
router.get("/:resource", authenticateJWT, validate(ExportQuerySchema), requireExportPermission, exportAdminResource);

export default router;
