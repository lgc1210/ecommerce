import { Router } from "express";
import { listCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from "./coupon.controller.js";
import { validate } from "../../middlewares/validate.js";
import { ListCouponsQuerySchema, CouponIdParamSchema, CreateCouponSchema, UpdateCouponSchema, ValidateCouponSchema } from "./coupon.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Customer (chỉ cần đăng nhập, chưa có permission "coupon:*" riêng cho khách hàng
// vì đây là hành động kiểm tra/áp mã lúc thanh toán, không phải quản trị mã giảm giá)
// ==========================================
router.post("/validate", authenticateJWT, validate(ValidateCouponSchema), validateCoupon);

// ==========================================
// Admin (yêu cầu permission "coupon:manage")
// ==========================================
router.get("/", authenticateJWT, requirePermission("coupon:manage"), validate(ListCouponsQuerySchema), listCoupons);
router.get("/id/:id", authenticateJWT, requirePermission("coupon:manage"), validate(CouponIdParamSchema), getCouponById);
router.post("/", authenticateJWT, requirePermission("coupon:manage"), validate(CreateCouponSchema), createCoupon);
router.patch("/id/:id", authenticateJWT, requirePermission("coupon:manage"), validate(UpdateCouponSchema), updateCoupon);
router.delete("/id/:id", authenticateJWT, requirePermission("coupon:manage"), validate(CouponIdParamSchema), deleteCoupon);

export default router;
