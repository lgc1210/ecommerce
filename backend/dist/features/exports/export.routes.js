import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { hasPermission } from "../../middlewares/rbac.js";
import { validate } from "../../middlewares/validate.js";
import { exportAdminResource } from "./export.controller.js";
import { ExportQuerySchema } from "./export.validation.js";
const permissions = {
    users: "user:read",
    categories: "catalog:read",
    products: "catalog:read",
    coupons: "coupon:manage",
    reviews: "review:update",
    contacts: "contact:manage",
    orders: "order:update",
    payments: "payment:read",
};
const requireExportPermission = async (req, res, next) => {
    try {
        const permission = permissions[req.params.resource];
        if (!permission || !req.user || !(await hasPermission(req.user.roleId, permission))) {
            res.status(403).json({ error: "Access Forbidden: bạn không có quyền xuất dữ liệu này." });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
const router = Router();
router.get("/:resource", authenticateJWT, validate(ExportQuerySchema), requireExportPermission, exportAdminResource);
export default router;
//# sourceMappingURL=export.routes.js.map