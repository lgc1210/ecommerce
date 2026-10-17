import type { NextFunction, Request, Response } from "express";
import transportService from "./transport.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
import type { ListShipmentsParams } from "./transport.validation.js";
import type { GhnPrintSize } from "../../external/ghn/ghn.utils.js";

export const listShipments = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const result = await transportService.listShipments(
			req.query as ListShipmentsParams,
		);
		res.status(200).json(result);
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const getShipmentDetail = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const data = await transportService.getShipmentDetail(
			Number(req.params.id),
		);
		res.status(200).json({ data });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const syncShipment = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const data = await transportService.syncShipment(Number(req.params.id));
		res.status(200).json({
			message: "Đã đồng bộ trạng thái vận chuyển từ Giao Hàng Nhanh.",
			data,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const printShipment = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const data = await transportService.getPrintUrl(
			Number(req.params.id),
			req.query.size as GhnPrintSize,
		);
		res.status(200).json({ data });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const redeliverShipment = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		await transportService.redeliverShipment(Number(req.params.id));
		res
			.status(200)
			.json({ message: "Đã yêu cầu Giao Hàng Nhanh giao lại đơn." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const returnShipment = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		await transportService.returnShipment(Number(req.params.id));
		res
			.status(200)
			.json({ message: "Đã yêu cầu Giao Hàng Nhanh hoàn đơn về shop." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
