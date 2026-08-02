/**
 * Dữ liệu tra cứu Tỉnh/Thành - Quận/Huyện - Phường/Xã, backend proxy qua GHN
 * (Giao Hàng Nhanh - xem backend `external/ghn`). Chỉ khai báo các field thực
 * sự dùng tới (ID + tên hiển thị); response GHN thật có thêm nhiều field khác
 * (Code, NameExtension, ...) nhưng không cần thiết cho form địa chỉ.
 */
export interface GhnProvince {
	ProvinceID: number;
	ProvinceName: string;
}

export interface GhnDistrict {
	DistrictID: number;
	ProvinceID: number;
	DistrictName: string;
}

export interface GhnWard {
	WardCode: string;
	DistrictID: number;
	WardName: string;
}
