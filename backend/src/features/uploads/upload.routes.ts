import { Router } from "express";
import { uploadProductImage, uploadWarrantyClaimImage } from "./upload.controller.js";
import { uploadProductImageMiddleware, uploadWarrantyClaimImageMiddleware } from "./upload.middleware.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// Admin - Upload 1 file ảnh từ máy (field "image", multipart/form-data), trả về URL để
// dùng làm Product.thumbnailUrl hoặc ProductImage.imageUrl. Cùng quyền với chỉnh sửa catalog.
router.post(
	"/product-image",
	authenticateJWT,
	requirePermission("catalog:write"),
	uploadProductImageMiddleware,
	uploadProductImage,
);

// Customer - Upload ảnh/video minh chứng lỗi khi gửi yêu cầu bảo hành. Cùng quyền với tạo claim.
router.post(
	"/warranty-claim-image",
	authenticateJWT,
	requirePermission("warranty_claim:create"),
	uploadWarrantyClaimImageMiddleware,
	uploadWarrantyClaimImage,
);

export default router;
