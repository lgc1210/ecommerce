import {
	WARRANTY_CLAIM_STATUS,
	WARRANTY_RESOLUTION_TYPE,
	type WarrantyClaimStatus,
	type WarrantyResolutionType,
} from "../../../../shared/constants/warranty";

export const WARRANTY_CLAIM_STATUS_LABEL: Record<WarrantyClaimStatus, string> = {
	[WARRANTY_CLAIM_STATUS.pending]: "Chờ xử lý",
	[WARRANTY_CLAIM_STATUS.approved]: "Đã duyệt",
	[WARRANTY_CLAIM_STATUS.rejected]: "Từ chối",
	[WARRANTY_CLAIM_STATUS.in_repair]: "Đang xử lý",
	[WARRANTY_CLAIM_STATUS.completed]: "Hoàn tất",
	[WARRANTY_CLAIM_STATUS.cancelled]: "Đã hủy",
};

export const WARRANTY_CLAIM_STATUS_BADGE_CLASSNAME: Record<WarrantyClaimStatus, string> = {
	[WARRANTY_CLAIM_STATUS.pending]: "bg-amber-50 text-amber-600",
	[WARRANTY_CLAIM_STATUS.approved]: "bg-blue-50 text-blue-600",
	[WARRANTY_CLAIM_STATUS.rejected]: "bg-red-50 text-red-600",
	[WARRANTY_CLAIM_STATUS.in_repair]: "bg-violet-50 text-violet-600",
	[WARRANTY_CLAIM_STATUS.completed]: "bg-primary-light text-primary-dark",
	[WARRANTY_CLAIM_STATUS.cancelled]: "bg-gray-100 text-gray-500",
};

export const WARRANTY_RESOLUTION_TYPE_LABEL: Record<WarrantyResolutionType, string> = {
	[WARRANTY_RESOLUTION_TYPE.repaired]: "Đã sửa chữa",
	[WARRANTY_RESOLUTION_TYPE.replaced]: "Đổi sản phẩm/linh kiện mới",
	[WARRANTY_RESOLUTION_TYPE.refunded]: "Hoàn tiền",
	[WARRANTY_RESOLUTION_TYPE.no_fault_found]: "Kiểm tra không phát hiện lỗi",
	[WARRANTY_RESOLUTION_TYPE.rejected]: "Từ chối bảo hành",
};

/**
 * Mirror của ALLOWED_CLAIM_TRANSITIONS ở backend (warranty.utils.ts:isValidWarrantyClaimStatusTransition)
 * — chỉ dùng để giới hạn option hiển thị trong dropdown đổi trạng thái cho gọn UX. Backend vẫn là
 * nơi validate thật sự, FE không tự ý tin tưởng 100% để tránh lệch logic nếu 2 bên không đồng bộ.
 * "completed"/"rejected"/"cancelled" là trạng thái cuối, không có bước chuyển tiếp.
 */
const ALLOWED_CLAIM_TRANSITIONS: Record<WarrantyClaimStatus, WarrantyClaimStatus[]> = {
	[WARRANTY_CLAIM_STATUS.pending]: [
		WARRANTY_CLAIM_STATUS.approved,
		WARRANTY_CLAIM_STATUS.rejected,
		WARRANTY_CLAIM_STATUS.cancelled,
	],
	[WARRANTY_CLAIM_STATUS.approved]: [
		WARRANTY_CLAIM_STATUS.in_repair,
		WARRANTY_CLAIM_STATUS.rejected,
		WARRANTY_CLAIM_STATUS.cancelled,
	],
	[WARRANTY_CLAIM_STATUS.in_repair]: [WARRANTY_CLAIM_STATUS.completed, WARRANTY_CLAIM_STATUS.rejected],
	[WARRANTY_CLAIM_STATUS.completed]: [],
	[WARRANTY_CLAIM_STATUS.rejected]: [],
	[WARRANTY_CLAIM_STATUS.cancelled]: [],
};

/** Danh sách trạng thái admin CÓ THỂ chuyển tới tiếp theo — không gồm trạng thái hiện tại (khác
 * getNextOrderStatusOptions của order, vì claim luôn cần chọn 1 hành động rõ ràng, không có
 * option "giữ nguyên"). Rỗng nếu đang ở trạng thái cuối. */
export const getNextWarrantyClaimStatusOptions = (current: WarrantyClaimStatus): WarrantyClaimStatus[] =>
	ALLOWED_CLAIM_TRANSITIONS[current];

export const isTerminalWarrantyClaimStatus = (status: WarrantyClaimStatus): boolean =>
	ALLOWED_CLAIM_TRANSITIONS[status].length === 0;
