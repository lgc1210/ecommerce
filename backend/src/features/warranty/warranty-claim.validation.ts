import { z } from "zod";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const positiveInt = z.number().int().positive();

export const WarrantyClaimIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const ListMyWarrantyClaimsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: z.enum(["pending", "approved", "rejected", "in_repair", "completed", "cancelled"]).optional(),
	}),
});

export const CreateWarrantyClaimSchema = z.object({
	body: z.object({
		orderItemId: positiveInt,
		issueDescription: z
			.string()
			.min(10, { message: "Mô tả lỗi cần ít nhất 10 ký tự để nhân viên nắm rõ tình trạng sản phẩm." })
			.max(2000),
		imageUrls: z
			.array(z.string().url({ message: "Đường dẫn ảnh không hợp lệ." }))
			.max(10, { message: "Tối đa 10 ảnh/video minh chứng." })
			.optional(),
		// Bắt buộc nếu SKU đang claim có trackSerial = true (validate thêm ở service, vì cần tra
		// DB mới biết SKU đó có track serial hay không — zod chỉ kiểm tra hình dạng cơ bản ở đây).
		productUnitId: positiveInt.optional(),
	}),
});

// ==========================================
// Admin (Phase 3)
// ==========================================
export const AdminListWarrantyClaimsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: z.enum(["pending", "approved", "rejected", "in_repair", "completed", "cancelled"]).optional(),
		search: z.string().max(255).optional(), // tìm theo claimNumber hoặc tên/email khách
	}),
});

export const UpdateWarrantyClaimStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z
		.object({
			status: z.enum(["approved", "rejected", "in_repair", "completed", "cancelled"]),
			staffNote: z.string().max(2000).optional(),
			resolutionType: z.enum(["repaired", "replaced", "refunded", "no_fault_found", "rejected"]).optional(),
			repairFee: z.number().min(0).optional(),
		})
		.superRefine((data, ctx) => {
			if (data.status === "rejected" && !data.staffNote) {
				ctx.addIssue({
					code: "custom",
					path: ["staffNote"],
					message: "Cần ghi rõ lý do khi từ chối yêu cầu bảo hành.",
				});
			}
			if (data.status === "completed" && !data.resolutionType) {
				ctx.addIssue({
					code: "custom",
					path: ["resolutionType"],
					message: "Cần chọn cách giải quyết (sửa/đổi mới/hoàn tiền...) khi hoàn tất claim.",
				});
			}
		}),
});

export type CreateWarrantyClaimInput = z.infer<typeof CreateWarrantyClaimSchema>["body"];
export type ListMyWarrantyClaimsParams = z.infer<typeof ListMyWarrantyClaimsQuerySchema>["query"];
export type AdminListWarrantyClaimsParams = z.infer<typeof AdminListWarrantyClaimsQuerySchema>["query"];
export type UpdateWarrantyClaimStatusInput = z.infer<typeof UpdateWarrantyClaimStatusSchema>["body"];
