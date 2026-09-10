import type { Response, NextFunction } from "express";
import type { Request } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resendOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const facebookLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMe: (req: any, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map