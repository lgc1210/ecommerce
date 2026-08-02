import { useQuery } from "@tanstack/react-query";
import locationService from "../services";
import type { GhnDistrict, GhnProvince, GhnWard } from "../types";

// Danh sách Tỉnh/Thành - Quận/Huyện - Phường/Xã gần như không đổi -> cache dài
// (1 ngày) để tránh gọi lại GHN mỗi lần mở form địa chỉ.
const LOCATION_STALE_TIME = 24 * 60 * 60 * 1000;

export const PROVINCES_QUERY_KEY = ["location", "provinces"] as const;

/** Toàn bộ Tỉnh/Thành phố. Luôn fetch (không phụ thuộc lựa chọn nào khác). */
export const useProvincesQuery = () => {
	return useQuery<GhnProvince[]>({
		queryKey: PROVINCES_QUERY_KEY,
		queryFn: async () => {
			const res = await locationService.getProvinces();
			return res.data.data;
		},
		staleTime: LOCATION_STALE_TIME,
	});
};

/** Quận/Huyện theo Tỉnh/Thành đang chọn. Không fetch khi chưa chọn Tỉnh/Thành. */
export const useDistrictsQuery = (provinceId: number | undefined) => {
	return useQuery<GhnDistrict[]>({
		queryKey: ["location", "districts", provinceId] as const,
		queryFn: async () => {
			const res = await locationService.getDistricts(provinceId!);
			return res.data.data;
		},
		enabled: Boolean(provinceId),
		staleTime: LOCATION_STALE_TIME,
	});
};

/** Phường/Xã theo Quận/Huyện đang chọn. Không fetch khi chưa chọn Quận/Huyện. */
export const useWardsQuery = (districtId: number | undefined) => {
	return useQuery<GhnWard[]>({
		queryKey: ["location", "wards", districtId] as const,
		queryFn: async () => {
			const res = await locationService.getWards(districtId!);
			return res.data.data;
		},
		enabled: Boolean(districtId),
		staleTime: LOCATION_STALE_TIME,
	});
};
