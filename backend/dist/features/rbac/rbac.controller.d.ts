import type { Request, Response, NextFunction } from "express";
export declare const createNewRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const fetchAllSystemRoles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const fetchRoleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createNewPermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const fetchAllPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const assignPermissionsToRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const revokePermissionFromRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.controller.d.ts.map