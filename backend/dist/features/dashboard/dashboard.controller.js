import dashboardService from "./dashboard.service.js";
export const getOverview = async (_req, res, next) => {
    try {
        const overview = await dashboardService.getOverview();
        res.status(200).json({ data: overview });
    }
    catch (error) {
        next(error);
    }
};
export const getRevenueSeries = async (req, res, next) => {
    try {
        const period = req.query.period ?? "30d";
        const series = await dashboardService.getRevenueSeries(period);
        res.status(200).json({ data: series });
    }
    catch (error) {
        next(error);
    }
};
export const getTopProducts = async (req, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const products = await dashboardService.getTopProducts(limit);
        res.status(200).json({ data: products });
    }
    catch (error) {
        next(error);
    }
};
export const getRecentOrders = async (req, res, next) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const orders = await dashboardService.getRecentOrders(limit);
        res.status(200).json({ data: orders });
    }
    catch (error) {
        next(error);
    }
};
export const getLowStockProducts = async (req, res, next) => {
    try {
        const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const products = await dashboardService.getLowStockProducts(threshold, limit);
        res.status(200).json({ data: products });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=dashboard.controller.js.map