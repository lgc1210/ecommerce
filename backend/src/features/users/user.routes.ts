import { Router } from "express";
import {
	updateOwnProfile,
	listOwnAddresses,
	createOwnAddress,
	updateOwnAddress,
	setDefaultOwnAddress,
	deleteOwnAddress,
	listUsers,
	getUserById,
	updateUserRole,
	updateUserStatus,
	createUser,
} from "./user.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	UpdateOwnProfileSchema,
	CreateAddressSchema,
	UpdateAddressSchema,
	AddressIdParamSchema,
	ListUsersQuerySchema,
	UserIdParamSchema,
	UpdateUserRoleSchema,
	UpdateUserStatusSchema,
	CreateUserSchema,
} from "./user.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Self-service (yêu cầu đăng nhập, không cần permission đặc biệt)
// ==========================================
router.patch("/me", authenticateJWT, validate(UpdateOwnProfileSchema), updateOwnProfile);

router.get("/me/addresses", authenticateJWT, listOwnAddresses);
router.post("/me/addresses", authenticateJWT, validate(CreateAddressSchema), createOwnAddress);
router.patch("/me/addresses/:addressId", authenticateJWT, validate(UpdateAddressSchema), updateOwnAddress);
router.patch("/me/addresses/:addressId/default", authenticateJWT, validate(AddressIdParamSchema), setDefaultOwnAddress);
router.delete("/me/addresses/:addressId", authenticateJWT, validate(AddressIdParamSchema), deleteOwnAddress);

// ==========================================
// Admin (yêu cầu permission "users:read", "users:write")
// ==========================================
router.post("/", authenticateJWT, requirePermission("user:write"), validate(CreateUserSchema), createUser);
router.get("/", authenticateJWT, requirePermission("user:read"), validate(ListUsersQuerySchema), listUsers);
router.get("/:id", authenticateJWT, requirePermission("user:read"), validate(UserIdParamSchema), getUserById);
router.patch("/:id/role", authenticateJWT, requirePermission("user:write"), validate(UpdateUserRoleSchema), updateUserRole);
router.patch("/:id/status", authenticateJWT, requirePermission("user:write"), validate(UpdateUserStatusSchema), updateUserStatus);

export default router;
