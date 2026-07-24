import type { Response, NextFunction } from "express";
import userService from "./user.service.js";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
import { handleServiceError } from "../../shared/service-error-handler.js";

// ==========================================
// Self-service: profile
// ==========================================
export const updateOwnProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const user = await userService.updateOwnProfile(req.user!.id, req.body);
		res.status(200).json({ message: "Cập nhật hồ sơ thành công.", data: user });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Self-service: addresses
// ==========================================
export const listOwnAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addresses = await userService.listOwnAddresses(req.user!.id);
		res.status(200).json({ data: addresses });
	} catch (error) {
		next(error);
	}
};

export const createOwnAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const address = await userService.createOwnAddress(req.user!.id, req.body);
		res.status(201).json({ message: "Thêm địa chỉ thành công.", data: address });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateOwnAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		const address = await userService.updateOwnAddress(req.user!.id, addressId, req.body);
		res.status(200).json({ message: "Cập nhật địa chỉ thành công.", data: address });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const setDefaultOwnAddress = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		const address = await userService.setDefaultOwnAddress(req.user!.id, addressId);
		res.status(200).json({ message: "Đặt địa chỉ mặc định thành công.", data: address });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const deleteOwnAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const addressId = Number(req.params.addressId);
		await userService.deleteOwnAddress(req.user!.id, addressId);
		res.status(200).json({ message: "Xóa địa chỉ thành công." });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

// ==========================================
// Admin
// ==========================================
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const user = await userService.createUser(req.body);
		res.status(201).json({
			message: "Tạo tài khoản thành công. Email hướng dẫn đặt mật khẩu đã được gửi cho người dùng.",
			data: user,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await userService.listUsers(req.query as Record<string, string>);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const user = await userService.getUserById(id);
		res.status(200).json({ data: user });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const { roleId } = req.body;
		const user = await userService.updateUserRole(id, roleId);
		res.status(200).json({ message: "Cập nhật role cho user thành công.", data: user });
	} catch (error) {
		handleServiceError(error, res, next);
	}
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		const id = Number(req.params.id);
		const { isActive } = req.body;
		const user = await userService.updateUserStatus(id, isActive);
		res.status(200).json({
			message: isActive ? "Kích hoạt tài khoản thành công." : "Vô hiệu hóa tài khoản thành công.",
			data: user,
		});
	} catch (error) {
		handleServiceError(error, res, next);
	}
};
