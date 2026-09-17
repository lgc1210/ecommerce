import { Router } from "express";
import {
	listWarrantyPolicies,
	getWarrantyPolicyById,
	createWarrantyPolicy,
	updateWarrantyPolicy,
	deleteWarrantyPolicy,
} from "./warranty.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	ListWarrantyPoliciesQuerySchema,
	WarrantyPolicyIdParamSchema,
	CreateWarrantyPolicySchema,
	UpdateWarrantyPolicySchema,
} from "./warranty.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Admin (yêu cầu permission "warranty_policy:manage")
// Không có route public — chính sách bảo hành chỉ hiển thị cho khách qua field lồng trong
// response của product (feature products), giống cách coupon không có endpoint public riêng.
// ==========================================
router.get(
	"/",
	authenticateJWT,
	requirePermission("warranty_policy:manage"),
	validate(ListWarrantyPoliciesQuerySchema),
	listWarrantyPolicies,
);
router.get(
	"/id/:id",
	authenticateJWT,
	requirePermission("warranty_policy:manage"),
	validate(WarrantyPolicyIdParamSchema),
	getWarrantyPolicyById,
);
router.post(
	"/",
	authenticateJWT,
	requirePermission("warranty_policy:manage"),
	validate(CreateWarrantyPolicySchema),
	createWarrantyPolicy,
);
router.patch(
	"/id/:id",
	authenticateJWT,
	requirePermission("warranty_policy:manage"),
	validate(UpdateWarrantyPolicySchema),
	updateWarrantyPolicy,
);
router.delete(
	"/id/:id",
	authenticateJWT,
	requirePermission("warranty_policy:manage"),
	validate(WarrantyPolicyIdParamSchema),
	deleteWarrantyPolicy,
);

export default router;
