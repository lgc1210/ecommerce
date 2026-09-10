import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const getCart: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addCartItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCartItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const removeCartItem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const clearCart: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cart.controller.d.ts.map