import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const listMessages: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const sendMessage: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=message.controller.d.ts.map