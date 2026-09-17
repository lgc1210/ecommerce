import { Router } from "express";
import {
	listWarrantableOrderItems,
	createWarrantyClaim,
	listMyWarrantyClaims,
	getMyWarrantyClaimById,
	cancelMyWarrantyClaim,
	listWarrantyClaimsAdmin,
	getWarrantyClaimByIdAdmin,
	updateWarrantyClaimStatus,
} from "./warranty-claim.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	CreateWarrantyClaimSchema,
	ListMyWarrantyClaimsQuerySchema,
	WarrantyClaimIdParamSchema,
	AdminListWarrantyClaimsQuerySchema,
	UpdateWarrantyClaimStatusSchema,
} from "./warranty-claim.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Customer (yêu cầu permission "warranty_claim:create" — tự quản lý claim của chính mình)
// ==========================================
router.get(
	"/warrantable-items",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	listWarrantableOrderItems,
);
router.get(
	"/me",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	validate(ListMyWarrantyClaimsQuerySchema),
	listMyWarrantyClaims,
);
router.get(
	"/me/id/:id",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	validate(WarrantyClaimIdParamSchema),
	getMyWarrantyClaimById,
);
router.patch(
	"/me/id/:id/cancel",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	validate(WarrantyClaimIdParamSchema),
	cancelMyWarrantyClaim,
);
router.post(
	"/",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	validate(CreateWarrantyClaimSchema),
	createWarrantyClaim,
);

// ==========================================
// Admin (yêu cầu permission "warranty_claim:manage")
// ==========================================
router.get(
	"/admin",
	authenticateJWT,
	requirePermission("warranty_claim:manage"),
	validate(AdminListWarrantyClaimsQuerySchema),
	listWarrantyClaimsAdmin,
);
router.get(
	"/admin/id/:id",
	authenticateJWT,
	requirePermission("warranty_claim:manage"),
	validate(WarrantyClaimIdParamSchema),
	getWarrantyClaimByIdAdmin,
);
router.patch(
	"/admin/id/:id/status",
	authenticateJWT,
	requirePermission("warranty_claim:manage"),
	validate(UpdateWarrantyClaimStatusSchema),
	updateWarrantyClaimStatus,
);

export default router;
