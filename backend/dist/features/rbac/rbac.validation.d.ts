import { z } from "zod";
export declare const CreateRoleSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreatePermissionSchema: z.ZodObject<{
    body: z.ZodObject<{
        resource: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RoleIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        roleId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AssignPermissionsSchema: z.ZodObject<{
    params: z.ZodObject<{
        roleId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        permissionIds: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RevokePermissionParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        roleId: z.ZodString;
        permissionId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type AssignPermissionsInput = z.infer<typeof AssignPermissionsSchema>;
//# sourceMappingURL=rbac.validation.d.ts.map