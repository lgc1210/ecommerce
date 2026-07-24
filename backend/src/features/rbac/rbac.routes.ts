import { Router } from "express";
import { createNewPermission, createNewRole, fetchAllSystemRoles, fetchAllPermissions, fetchRoleById, assignPermissionsToRole, revokePermissionFromRole } from "./rbac.controller.js";
import { validate } from "../../middlewares/validate.js";
import { CreatePermissionSchema, CreateRoleSchema, RoleIdParamSchema, AssignPermissionsSchema, RevokePermissionParamSchema } from "./rbac.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// Toàn bộ route rbac đều yêu cầu đăng nhập + quyền "rbac:manage",
// trừ GET /roles chỉ yêu cầu đăng nhập (đọc danh sách role để hiển thị UI).

// ---------- Roles ----------
router.post("/roles", authenticateJWT, requirePermission("rbac:manage"), validate(CreateRoleSchema), createNewRole);
router.get("/roles", authenticateJWT, requirePermission("rbac:manage"), fetchAllSystemRoles);
router.get("/roles/:roleId", authenticateJWT, requirePermission("rbac:manage"), validate(RoleIdParamSchema), fetchRoleById);

// ---------- Permissions ----------
router.post("/permissions", authenticateJWT, requirePermission("rbac:manage"), validate(CreatePermissionSchema), createNewPermission);
router.get("/permissions", authenticateJWT, requirePermission("rbac:manage"), fetchAllPermissions);

// ---------- Role <-> Permission linking ----------
router.post("/roles/:roleId/permissions", authenticateJWT, requirePermission("rbac:manage"), validate(AssignPermissionsSchema), assignPermissionsToRole);
router.delete("/roles/:roleId/permissions/:permissionId", authenticateJWT, requirePermission("rbac:manage"), validate(RevokePermissionParamSchema), revokePermissionFromRole);

export default router;
