import { Router } from "express";
import {
	listProducts,
	getProductBySlug,
	getFeaturedProducts,
	listProductsAdmin,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	createSku,
	updateSku,
	updateSkuStock,
	deleteSku,
	addSkuImage,
	updateSkuImage,
	deleteSkuImage,
} from "./product.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
	ListProductsQuerySchema,
	ProductSlugParamSchema,
	FeaturedProductsQuerySchema,
	ProductIdParamSchema,
	CreateProductSchema,
	UpdateProductSchema,
	CreateSkuSchema,
	UpdateSkuSchema,
	SkuParamSchema,
	UpdateStockSchema,
	CreateSkuImageSchema,
	UpdateSkuImageSchema,
	SkuImageParamSchema,
} from "./product.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Public (không yêu cầu đăng nhập)
// ==========================================
router.get("/", validate(ListProductsQuerySchema), listProducts);
router.get("/featured", validate(FeaturedProductsQuerySchema), getFeaturedProducts);
router.get("/slug/:slug", validate(ProductSlugParamSchema), getProductBySlug);

// ==========================================
// Admin (yêu cầu permission "catalog:read", "catalog:write")
// ==========================================
router.get("/admin", authenticateJWT, requirePermission("catalog:read"), validate(ListProductsQuerySchema), listProductsAdmin);
router.get("/id/:id", authenticateJWT, requirePermission("catalog:read"), validate(ProductIdParamSchema), getProductById);
router.post("/", authenticateJWT, requirePermission("catalog:write"), validate(CreateProductSchema), createProduct);
router.patch("/id/:id", authenticateJWT, requirePermission("catalog:write"), validate(UpdateProductSchema), updateProduct);
router.delete("/id/:id", authenticateJWT, requirePermission("catalog:write"), validate(ProductIdParamSchema), deleteProduct);

// ==========================================
// Admin - Product SKU (biến thể) (yêu cầu permission "catalog:write", tồn kho dùng "inventory:update")
// ==========================================
router.post("/id/:id/skus", authenticateJWT, requirePermission("catalog:write"), validate(CreateSkuSchema), createSku);
router.patch("/id/:id/skus/:skuId", authenticateJWT, requirePermission("catalog:write"), validate(UpdateSkuSchema), updateSku);
router.patch("/id/:id/skus/:skuId/stock", authenticateJWT, requirePermission("inventory:update"), validate(UpdateStockSchema), updateSkuStock);
router.delete("/id/:id/skus/:skuId", authenticateJWT, requirePermission("catalog:write"), validate(SkuParamSchema), deleteSku);

// ==========================================
// Admin - Product Images theo từng SKU (biến thể) (yêu cầu permission "catalog:write")
// ==========================================
router.post("/id/:id/skus/:skuId/images", authenticateJWT, requirePermission("catalog:write"), validate(CreateSkuImageSchema), addSkuImage);
router.patch("/id/:id/skus/:skuId/images/:imageId", authenticateJWT, requirePermission("catalog:write"), validate(UpdateSkuImageSchema), updateSkuImage);
router.delete("/id/:id/skus/:skuId/images/:imageId", authenticateJWT, requirePermission("catalog:write"), validate(SkuImageParamSchema), deleteSkuImage);

export default router;
