import { z } from "zod";

const vietnamesePhoneRegex = /^(0|\+84)[0-9]{9,10}$/;
const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });

// ==========================================
// Admin: listing & lookup
// ==========================================
export const ListAddressesQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(255).optional(),
		userId: z.string().regex(/^\d+$/).optional(),
		addressType: z.enum(["shipping", "billing"]).optional(),
		province: z.string().max(100).optional(),
	}),
});

export const AddressIdParamSchema = z.object({
	params: z.object({ addressId: numericIdString }),
});

export const UserIdParamSchema = z.object({
	params: z.object({ userId: numericIdString }),
});

// ==========================================
// Admin: mutation
// ==========================================
export const AdminUpdateAddressSchema = z.object({
	params: z.object({ addressId: numericIdString }),
	body: z
		.object({
			addressType: z.enum(["shipping", "billing"]).optional(),
			recipientName: z.string().min(2, { message: "Tên người nhận phải có ít nhất 2 ký tự." }).max(100).optional(),
			phoneNumber: z.string().regex(vietnamesePhoneRegex, { message: "Số điện thoại không hợp lệ." }).optional(),
			addressLine: z.string().min(5, { message: "Địa chỉ cụ thể phải có ít nhất 5 ký tự." }).max(255).optional(),
			ward: z.string().min(1, { message: "Vui lòng nhập Phường/Xã." }).max(100).optional(),
			province: z.string().min(1, { message: "Vui lòng nhập Tỉnh/Thành phố." }).max(100).optional(),
			isDefault: z.boolean().optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});
