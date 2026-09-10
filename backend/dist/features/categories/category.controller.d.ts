import type { Request, Response, NextFunction } from "express";
export declare const listCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryBySlug: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map