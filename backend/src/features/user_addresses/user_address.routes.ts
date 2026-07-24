import { Router } from "express";
import {
	listAddresses,
	getAddressById,
	listAddressesByUser,
	adminUpdateAddress,
	adminDeleteAddress,
} from "./user_address.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	ListAddressesQuerySchema,
	AddressIdParamSchema,
	UserIdParamSchema,
	AdminUpdateAddressSchema,
} from "./user_address.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// Toàn bộ route dưới đây là quản trị (admin), thao tác trên địa chỉ của MỌI người dùng.
// Phần self-service (khách hàng tự quản lý địa chỉ của chính họ) nằm ở feature "users" (/api/users/me/addresses).

router.get("/", authenticateJWT, requirePermission("user:read"), validate(ListAddressesQuerySchema), listAddresses);
router.get(
	"/:addressId",
	authenticateJWT,
	requirePermission("user:read"),
	validate(AddressIdParamSchema),
	getAddressById,
);
router.get(
	"/user/:userId",
	authenticateJWT,
	requirePermission("user:read"),
	validate(UserIdParamSchema),
	listAddressesByUser,
);
router.patch(
	"/:addressId",
	authenticateJWT,
	requirePermission("user:write"),
	validate(AdminUpdateAddressSchema),
	adminUpdateAddress,
);
router.delete(
	"/:addressId",
	authenticateJWT,
	requirePermission("user:write"),
	validate(AddressIdParamSchema),
	adminDeleteAddress,
);

export default router;
