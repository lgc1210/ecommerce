import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const updateOwnProfile: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listOwnAddresses: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createOwnAddress: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOwnAddress: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const setDefaultOwnAddress: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOwnAddress: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listUsers: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserById: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserRole: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map