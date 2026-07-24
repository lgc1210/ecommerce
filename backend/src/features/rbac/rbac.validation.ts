import { z } from "zod";

export const CreateRoleSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(3, { message: "Role name must contain at least 3 characters." })
			.max(50, { message: "Role name must be under 50 characters." })
			.transform((val) => val.toLowerCase().trim()), // Keep names uniform (e.g., 'manager')
		description: z.string().max(255).optional(),
	}),
});

export const CreatePermissionSchema = z.object({
	body: z.object({
		resource: z
			.string()
			.min(3, { message: "Permission resource must contain at least 3 characters." })
			.max(50, { message: "Permission resource must be under 50 characters." })
			.transform((val) => val.toLowerCase().trim()), // Keep names uniform (e.g., 'users, products')
		name: z
			.string()
			.min(3, { message: "Permission name must contain at least 3 characters." })
			.max(50, { message: "Permission name must be under 50 characters." })
			.transform((val) => val.toLowerCase().trim()), // Keep names uniform (e.g., 'users:read, user:write')
		description: z.string().max(255).optional(),
	}),
});

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });

export const RoleIdParamSchema = z.object({
	params: z.object({
		roleId: numericIdString,
	}),
});

export const AssignPermissionsSchema = z.object({
	params: z.object({
		roleId: numericIdString,
	}),
	body: z.object({
		permissionIds: z.array(z.number().int().positive()).min(1, { message: "At least 1 permissionId is required." }),
	}),
});

export const RevokePermissionParamSchema = z.object({
	params: z.object({
		roleId: numericIdString,
		permissionId: numericIdString,
	}),
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type AssignPermissionsInput = z.infer<typeof AssignPermissionsSchema>;
