import {
	DURATION_UNIT,
	WARRANTY_PROVIDER_TYPE,
	type DurationUnit,
	type WarrantyProviderType,
} from "../../../../shared/constants/warranty";

export const DURATION_UNIT_LABEL: Record<DurationUnit, string> = {
	[DURATION_UNIT.day]: "Ngày",
	[DURATION_UNIT.month]: "Tháng",
	[DURATION_UNIT.year]: "Năm",
};

export const WARRANTY_PROVIDER_TYPE_LABEL: Record<WarrantyProviderType, string> = {
	[WARRANTY_PROVIDER_TYPE.manufacturer]: "Nhà sản xuất",
	[WARRANTY_PROVIDER_TYPE.store]: "Cửa hàng",
};

export const formatDuration = (value: number, unit: DurationUnit): string =>
	`${value} ${DURATION_UNIT_LABEL[unit].toLowerCase()}`;

/**
 * Quy đổi tương đối (tháng=30, năm=365) chỉ để SO SÁNH độ dài 2 khoảng thời gian khác đơn vị —
 * mirror y hệt toApproxDays() ở backend (warranty.utils.ts). Dùng để validate ngay trên form
 * trước khi submit, cho UX nhanh hơn; backend vẫn là nơi validate thật sự (assertExchangePeriodWithinDuration).
 */
const UNIT_TO_APPROX_DAYS: Record<DurationUnit, number> = { day: 1, month: 30, year: 365 };
export const toApproxDays = (value: number, unit: DurationUnit): number => value * UNIT_TO_APPROX_DAYS[unit];
