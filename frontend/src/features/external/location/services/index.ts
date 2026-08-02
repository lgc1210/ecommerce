import apiClient from "../../../../configs/apis";
import type { GhnDistrict, GhnProvince, GhnWard } from "../types";

/**
 * Endpoint tra cứu địa chỉ hành chính (GHN), mount tại "/external/ghn" (xem
 * backend `external/ghn`). "/provinces" yêu cầu đăng nhập; "/districts" và
 * "/wards" thì không, nhưng cả 3 chỉ được dùng trong các form đã yêu cầu
 * đăng nhập (sổ địa chỉ tài khoản, thanh toán) nên không ảnh hưởng.
 */
const locationService = {
	getProvinces: async () => apiClient.get<{ data: GhnProvince[] }>("/external/ghn/provinces"),

	getDistricts: async (provinceId: number) =>
		apiClient.get<{ data: GhnDistrict[] }>("/external/ghn/districts", { params: { provinceId } }),

	getWards: async (districtId: number) =>
		apiClient.get<{ data: GhnWard[] }>("/external/ghn/wards", { params: { districtId } }),
};

export default locationService;
