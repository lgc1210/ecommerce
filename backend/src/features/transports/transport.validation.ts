import { z } from "zod";
import { numericIdString } from "../../shared/validation.js";

const isoDateString = z
	.string()
	.refine((value) => !Number.isNaN(Date.parse(value)), {
		message: "Định dạng ngày không hợp lệ (cần dạng ISO 8601).",
	});

export const ListShipmentsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		// Trạng thái vận chuyển thô của GHN (ready_to_pick, delivering, delivery_fail, ...) — không giới hạn
		// bằng enum cứng vì GHN có thể bổ sung trạng thái mới mà không báo trước.
		ghnStatus: z.string().max(50).optional(),
		search: z.string().max(100).optional(),
		dateFrom: isoDateString.optional(),
		dateTo: isoDateString.optional(),
	}),
});

export const ShipmentIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const PrintShipmentSchema = z.object({
	params: z.object({ id: numericIdString }),
	query: z.object({
		size: z.enum(["a5", "80x80", "50x72"]).default("a5"),
	}),
});

export type ListShipmentsParams = z.infer<
	typeof ListShipmentsQuerySchema
>["query"];
