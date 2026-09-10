import type { Request, Response, NextFunction } from "express";
export declare const listProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductBySlug: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFeaturedProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listProductsAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createSku: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSku: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSkuStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSku: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addSkuImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateSkuImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteSkuImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map