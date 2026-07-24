import { Router } from "express";
import {
	createContact,
	listOwnContacts,
	listContacts,
	getContactById,
	updateContactStatus,
	deleteContact,
} from "./contact.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	CreateContactSchema,
	ListOwnContactsQuerySchema,
	ListContactsQuerySchema,
	ContactIdParamSchema,
	UpdateContactStatusSchema,
} from "./contact.validation.js";
import { authenticateJWT, authenticateOptional } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Public (không yêu cầu đăng nhập; nếu khách đang đăng nhập thì tự gắn userId)
// ==========================================
router.post("/", authenticateOptional, validate(CreateContactSchema), createContact);

// ==========================================
// Self-service (yêu cầu đăng nhập, không cần permission đặc biệt)
// ==========================================
router.get("/me", authenticateJWT, validate(ListOwnContactsQuerySchema), listOwnContacts);

// ==========================================
// Admin (yêu cầu permission "contact:manage")
// ==========================================
router.get("/", authenticateJWT, requirePermission("contact:manage"), validate(ListContactsQuerySchema), listContacts);
router.get(
	"/:id",
	authenticateJWT,
	requirePermission("contact:manage"),
	validate(ContactIdParamSchema),
	getContactById,
);
router.patch(
	"/:id/status",
	authenticateJWT,
	requirePermission("contact:manage"),
	validate(UpdateContactStatusSchema),
	updateContactStatus,
);
router.delete(
	"/:id",
	authenticateJWT,
	requirePermission("contact:manage"),
	validate(ContactIdParamSchema),
	deleteContact,
);

export default router;
