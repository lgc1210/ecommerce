import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authenticate.js";
import { getDistricts, getProvinces, getWards } from "./ghn.controller.js";
import { validate } from "../../middlewares/validate.js";
import { DistrictSchema, WardSchema } from "./ghn.validation.js";

const router = Router();

router.get("/provinces", authenticateJWT, getProvinces);
router.get("/districts", authenticateJWT, validate(DistrictSchema), getDistricts);
router.get("/wards", authenticateJWT, validate(WardSchema), getWards);

export default router;
