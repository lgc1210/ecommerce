declare class RbacService {
    createRole(name: string, description?: string): Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        description: string | null;
    }>;
    getAllRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        description: string | null;
    })[]>;
    getRoleById(roleId: number): Promise<{
        permissions: {
            id: number;
            createdAt: Date | null;
            name: string;
            description: string | null;
            resource: string;
        }[];
        _count: {
            users: number;
        };
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        description: string | null;
    }>;
    createPermission(resource: string, name: string, description?: string): Promise<{
        id: number;
        createdAt: Date | null;
        name: string;
        description: string | null;
        resource: string;
    }>;
    getAllPermissions(): Promise<{
        id: number;
        createdAt: Date | null;
        name: string;
        description: string | null;
        resource: string;
    }[]>;
    assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<{
        permissions: {
            id: number;
            createdAt: Date | null;
            name: string;
            description: string | null;
            resource: string;
        }[];
        _count: {
            users: number;
        };
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        description: string | null;
    }>;
    revokePermissionFromRole(roleId: number, permissionId: number): Promise<{
        permissions: {
            id: number;
            createdAt: Date | null;
            name: string;
            description: string | null;
            resource: string;
        }[];
        _count: {
            users: number;
        };
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        description: string | null;
    }>;
}
declare const _default: RbacService;
export default _default;
//# sourceMappingURL=rbac.service.d.ts.map