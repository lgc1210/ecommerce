import { z } from "zod";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });

const DurationUnitEnum = z.enum(["day", "month", "year"]);
const WarrantyProviderTypeEnum = z.enum(["manufacturer", "store"]);

// "Cùng có hoặc cùng không có" — chính sách hoặc không áp dụng đổi mới 1-đổi-1 (cả 2 field = null/undefined),
// hoặc phải khai báo đủ cả giá trị lẫn đơn vị. Việc so sánh "đổi mới không được dài hơn tổng thời hạn"
// nằm ở warranty.utils.ts (assertExchangePeriodWithinDuration), gọi từ service — không đặt ở đây vì
// khi UPDATE, client có thể chỉ gửi 1 trong 2 nhóm field, phải merge với dữ liệu hiện có trong DB rồi
// mới so sánh được trạng thái cuối cùng.
function refineExchangePeriodPairing(
	// exactOptionalPropertyTypes:true bắt phải khai rõ `| undefined` — schema thật (CreateWarrantyPolicySchema
	// / UpdateWarrantyPolicySchema) suy ra kiểu "number | null | undefined" cho 2 field optional+nullable
	// này (khác với chỉ đánh dấu `?:` — dưới flag này 2 khái niệm không tương đương nhau).
	data: {
		exchangePeriodValue?: number | null | undefined;
		exchangePeriodUnit?: DurationUnitValueInput | null | undefined;
	},
	ctx: z.RefinementCtx,
) {
	const hasValue = data.exchangePeriodValue !== undefined && data.exchangePeriodValue !== null;
	const hasUnit = data.exchangePeriodUnit !== undefined && data.exchangePeriodUnit !== null;

	if (hasValue !== hasUnit) {
		ctx.addIssue({
			code: "custom",
			path: ["exchangePeriodUnit"],
			message: "exchangePeriodValue và exchangePeriodUnit phải cùng có hoặc cùng không có giá trị.",
		});
	}
}

type DurationUnitValueInput = z.infer<typeof DurationUnitEnum>;

// ==========================================
// Admin
// ==========================================
export const ListWarrantyPoliciesQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(255).optional(),
	}),
});

export const WarrantyPolicyIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const CreateWarrantyPolicySchema = z.object({
	body: z
		.object({
			name: z.string().min(2, { message: "Tên chính sách phải có ít nhất 2 ký tự." }).max(255),
			durationValue: z.number().int().positive({ message: "Thời hạn bảo hành phải là số nguyên dương." }),
			durationUnit: DurationUnitEnum,
			warrantyType: WarrantyProviderTypeEnum,
			exchangePeriodValue: z.number().int().positive().nullable().optional(),
			exchangePeriodUnit: DurationUnitEnum.nullable().optional(),
			description: z.string().max(5000).optional(),
		})
		.superRefine(refineExchangePeriodPairing),
});

export const UpdateWarrantyPolicySchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			name: z.string().min(2, { message: "Tên chính sách phải có ít nhất 2 ký tự." }).max(255).optional(),
			durationValue: z.number().int().positive({ message: "Thời hạn bảo hành phải là số nguyên dương." }).optional(),
			durationUnit: DurationUnitEnum.optional(),
			warrantyType: WarrantyProviderTypeEnum.optional(),
			exchangePeriodValue: z.number().int().positive().nullable().optional(),
			exchangePeriodUnit: DurationUnitEnum.nullable().optional(),
			description: z.string().max(5000).optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." })
		.superRefine(refineExchangePeriodPairing),
});

export type CreateWarrantyPolicyInput = z.infer<typeof CreateWarrantyPolicySchema>["body"];
export type UpdateWarrantyPolicyInput = z.infer<typeof UpdateWarrantyPolicySchema>["body"];
export type ListWarrantyPoliciesParams = z.infer<typeof ListWarrantyPoliciesQuerySchema>["query"];
