import { exportResource } from "./export.service.js";
export const exportAdminResource = async (req, res, next) => {
    try {
        await exportResource(req.params.resource, req.query, res);
        res.end();
    }
    catch (error) {
        if (!res.headersSent)
            next(error);
        else
            res.destroy(error);
    }
};
//# sourceMappingURL=export.controller.js.map