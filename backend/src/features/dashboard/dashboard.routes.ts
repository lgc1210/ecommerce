import { Router } from "express";
import { getOverview, getRevenueSeries, getTopProducts, getRecentOrders, getLowStockProducts } from "./dashboard.controller.js";
import { validate } from "../../middlewares/validate.js";
import { RevenueSeriesQuerySchema, TopProductsQuerySchema, RecentOrdersQuerySchema, LowStockQuerySchema } from "./dashboard.validation.js";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";

const router = Router();

// ==========================================
// Admin/Manager (yêu cầu permission "dashboard:read")
// ==========================================
router.get("/overview", authenticateJWT, requirePermission("dashboard:read"), getOverview);
router.get("/revenue", authenticateJWT, requirePermission("dashboard:read"), validate(RevenueSeriesQuerySchema), getRevenueSeries);
router.get("/top-products", authenticateJWT, requirePermission("dashboard:read"), validate(TopProductsQuerySchema), getTopProducts);
router.get("/recent-orders", authenticateJWT, requirePermission("dashboard:read"), validate(RecentOrdersQuerySchema), getRecentOrders);
router.get("/low-stock", authenticateJWT, requirePermission("dashboard:read"), validate(LowStockQuerySchema), getLowStockProducts);

export default router;
