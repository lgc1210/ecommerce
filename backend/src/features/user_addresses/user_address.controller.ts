import type { Request, Response, NextFunction } from "express";
import userAddressService from "./user_address.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Admin: listing & lookup
// ==========================================
export const listAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await userAddressService.listAddresses(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		const address = await userAddressService.getAddressById(addressId);
		res.status(200).json({ data: address });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const listAddressesByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = Number(req.params.userId);
		const addresses = await userAddressService.listAddressesByUser(userId);
		res.status(200).json({ data: addresses });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin: mutation
// ==========================================
export const adminUpdateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		const address = await userAddressService.adminUpdateAddress(addressId, req.body);
		res.status(200).json({ message: "Cập nhật địa chỉ thành công.", data: address });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const adminDeleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		await userAddressService.adminDeleteAddress(addressId);
		res.status(200).json({ message: "Xóa địa chỉ thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
