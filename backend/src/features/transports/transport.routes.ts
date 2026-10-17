import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { requirePermission } from "../../middlewares/rbac.js";
import { validate } from "../../middlewares/validate.js";
import {
	getShipmentDetail,
	listShipments,
	printShipment,
	redeliverShipment,
	returnShipment,
	syncShipment,
} from "./transport.controller.js";
import {
	ListShipmentsQuerySchema,
	PrintShipmentSchema,
	ShipmentIdParamSchema,
} from "./transport.validation.js";

const router = Router();

// Toàn bộ route dưới đây chỉ dành cho admin quản lý vận chuyển — permission "transport:manage" (xem rbac.seed.ts).
const guard = [authenticateJWT, requirePermission("transport:manage")];

router.get("/", ...guard, validate(ListShipmentsQuerySchema), listShipments);
router.get(
	"/:id",
	...guard,
	validate(ShipmentIdParamSchema),
	getShipmentDetail,
);
router.post(
	"/:id/sync",
	...guard,
	validate(ShipmentIdParamSchema),
	syncShipment,
);
router.get(
	"/:id/print",
	...guard,
	validate(PrintShipmentSchema),
	printShipment,
);
router.post(
	"/:id/redeliver",
	...guard,
	validate(ShipmentIdParamSchema),
	redeliverShipment,
);
router.post(
	"/:id/return",
	...guard,
	validate(ShipmentIdParamSchema),
	returnShipment,
);

export default router;
