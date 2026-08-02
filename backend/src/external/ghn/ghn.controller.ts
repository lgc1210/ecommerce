import type { NextFunction, Request, Response } from "express";
import { ghnClient } from "../../config/axios.js";
import { env } from "../../config/dotenv.js";

// 1. Định nghĩa Interface cho bộ nhớ Cache
interface GHNCache {
	provinces: any[] | null;
	districts: Record<number, any[]>; // Key là số (provinceId), value là mảng dữ liệu
	wards: Record<number, any[]>; // Key là số (districtId), value là mảng dữ liệu
}

// 2. Khai báo biến ghnCache kèm theo kiểu dữ liệu vừa tạo
const ghnCache: GHNCache = {
	provinces: null,
	districts: {},
	wards: {},
};

export const getProvinces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		// 1. Kiểm tra nếu đã có dữ liệu trong Cache thì trả về luôn
		if (ghnCache.provinces) {
			res.status(200).json({
				success: true,
				message: "Lấy danh sách tỉnh/thành thành công (cached)",
				data: ghnCache.provinces,
			});
			return;
		}

		// 2. Nếu chưa có, gọi sang API GHN
		const response = await ghnClient.get(`${env.GHN_API_URL}/master-data/province`);

		// 3. Lưu vào Cache và trả về cho Frontend
		ghnCache.provinces = response.data.data;

		res.status(200).json({
			success: true,
			message: "Lấy danh sách tỉnh/thành thành công",
			data: response.data.data,
		});
	} catch (error) {
		next(error);
	}
};

export const getDistricts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const provinceId = Number(req.query.provinceId);

		// 1. Kiểm tra Cache dựa trên ID của Tỉnh
		if (ghnCache.districts[provinceId]) {
			res.status(200).json({
				success: true,
				message: "Lấy danh sách quận/huyện thành công (cached)",
				data: ghnCache.districts[provinceId],
			});
			return;
		}

		// 2. Gọi sang API GHN (Yêu cầu phương thức POST và truyền body)
		const response = await ghnClient.post(`${env.GHN_API_URL}/master-data/district`, {
			province_id: provinceId,
		});

		// 3. Lưu vào Cache theo key là provinceId
		ghnCache.districts[provinceId] = response.data.data;

		res.status(200).json({
			success: true,
			message: "Lấy danh sách quận/huyện thành công",
			data: response.data.data,
		});
	} catch (error) {
		next(error);
	}
};

export const getWards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const districtId = Number(req.query.districtId);

		// 1. Kiểm tra Cache dựa trên ID của Quận
		if (ghnCache.wards[districtId]) {
			res.status(200).json({
				success: true,
				message: "Lấy danh sách phường/xã thành công (cached)",
				data: ghnCache.wards[districtId],
			});
			return;
		}

		// 2. Gọi sang API GHN (Gửi district_id qua query string hoặc body theo chuẩn GHN)
		const response = await ghnClient.post(`${env.GHN_API_URL}/master-data/ward?district_id`, {
			district_id: districtId,
		});

		// 3. Lưu vào Cache theo key là districtId
		ghnCache.wards[districtId] = response.data.data;

		res.status(200).json({
			success: true,
			message: "Lấy danh sách phường/xã thành công",
			data: response.data.data,
		});
	} catch (error) {
		next(error);
	}
};
