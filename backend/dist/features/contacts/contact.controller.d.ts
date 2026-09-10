import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const createContact: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listOwnContacts: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listContacts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getContactById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateContactStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteContact: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=contact.controller.d.ts.map