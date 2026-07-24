import { Router } from "express";
import { listCategories, getCategoryBySlug, getCategoryById, createCategory, updateCategory, deleteCategory } from "./category.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ListCategoriesQuerySchema, CategorySlugParamSchema, CategoryIdParamSchema, CreateCategorySchema, UpdateCategorySchema } from "./category.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Public (không yêu cầu đăng nhập)
// ==========================================
router.get("/", validate(ListCategoriesQuerySchema), listCategories);
router.get("/slug/:slug", validate(CategorySlugParamSchema), getCategoryBySlug);

// ==========================================
// Admin (yêu cầu permission "catalog:read", "catalog:write")
// ==========================================
router.get("/id/:id", authenticateJWT, requirePermission("catalog:read"), validate(CategoryIdParamSchema), getCategoryById);
router.post("/", authenticateJWT, requirePermission("catalog:write"), validate(CreateCategorySchema), createCategory);
router.patch("/id/:id", authenticateJWT, requirePermission("catalog:write"), validate(UpdateCategorySchema), updateCategory);
router.delete("/id/:id", authenticateJWT, requirePermission("catalog:write"), validate(CategoryIdParamSchema), deleteCategory);

export default router;
