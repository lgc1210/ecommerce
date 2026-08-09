import { z } from "zod";
import { AddressTag } from "../../generated/prisma/index.js";
import { numericIdString, vietnamesePhoneRegex } from "../../shared/validation.js";

// ==========================================
// Self-service: profile
// ==========================================
export const UpdateOwnProfileSchema = z.object({
	body: z
		.object({
			name: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }).max(100).optional(),
			phone: z.string().regex(vietnamesePhoneRegex, { message: "Số điện thoại không hợp lệ." }).optional(),
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

// ==========================================
// Self-service: addresses
// ==========================================
const addressBodyShape = {
	tag: z.enum([AddressTag.home, AddressTag.office]).optional(),
	recipientName: z.string().min(2, { message: "Tên người nhận phải có ít nhất 2 ký tự." }).max(100),
	phoneNumber: z.string().regex(vietnamesePhoneRegex, { message: "Số điện thoại không hợp lệ." }),
	addressLine: z.string().min(5, { message: "Địa chỉ cụ thể phải có ít nhất 5 ký tự." }).max(150),
	wardName: z.string().min(1, { message: "Vui lòng nhập Phường/Xã." }).max(100),
	districtName: z.string().min(1, { message: "Vui lòng nhập Quận/Huyện." }).max(100),
	provinceName: z.string().min(1, { message: "Vui lòng nhập Tỉnh/Thành phố." }).max(100),
	provinceId: z.number().int().positive({ message: "provinceId phải là số nguyên dương." }),
	districtId: z.number().int().positive({ message: "districtId phải là số nguyên dương." }),
	wardCode: z.string().min(1, { message: "Vui lòng nhập mã Phường/Xã." }).max(20),
	isDefault: z.boolean().optional(),
};

export const CreateAddressSchema = z.object({
	body: z.object(addressBodyShape),
});

export const UpdateAddressSchema = z.object({
	params: z.object({ addressId: numericIdString }),
	body: z
		.object({
			tag: addressBodyShape.tag,
			recipientName: addressBodyShape.recipientName.optional(),
			phoneNumber: addressBodyShape.phoneNumber.optional(),
			addressLine: addressBodyShape.addressLine.optional(),
			wardName: addressBodyShape.wardName.optional(),
			districtName: addressBodyShape.districtName.optional(),
			provinceName: addressBodyShape.provinceName.optional(),
			provinceId: addressBodyShape.provinceId.optional(),
			districtId: addressBodyShape.districtId.optional(),
			wardCode: addressBodyShape.wardCode.optional(),
			isDefault: addressBodyShape.isDefault,
		})
		.refine((data) => Object.keys(data).length > 0, { message: "Cần ít nhất 1 trường để cập nhật." }),
});

export const AddressIdParamSchema = z.object({
	params: z.object({ addressId: numericIdString }),
});

// ==========================================
// Admin
// ==========================================
export const ListUsersQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(255).optional(),
		roleId: z.string().regex(/^\d+$/).optional(),
		isActive: z.enum(["true", "false"]).optional(),
	}),
});

export const UserIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const CreateUserSchema = z.object({
	body: z.object({
		name: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }).max(100),
		email: z.email({ message: "Email không hợp lệ." }),
		phone: z.string().regex(vietnamesePhoneRegex, { message: "Số điện thoại không hợp lệ." }),
		roleId: z.number().int().positive({ message: "roleId phải là số nguyên dương." }),
	}),
});

export const UpdateUserRoleSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({
		roleId: z.number().int().positive({ message: "roleId phải là số nguyên dương." }),
	}),
});

export const UpdateUserStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({
		isActive: z.boolean(),
	}),
});
