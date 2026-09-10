import type { NextFunction, Request, Response } from "express";
import { exportResource } from "./export.service.js";
import type { ExportResource, ExportQuery } from "./export.validation.js";

export const exportAdminResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		await exportResource(req.params.resource as ExportResource, req.query as ExportQuery, res);
		res.end();
	} catch (error) {
		if (!res.headersSent) next(error);
		else res.destroy(error as Error);
	}
};
