import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const listOwnNotifications: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAsRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markAllAsRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteOwnNotification: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAllReadNotifications: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const broadcastNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=notification.controller.d.ts.map