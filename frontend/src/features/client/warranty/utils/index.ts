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
	[WARRANTY_RESOLUTION_TYPE.replaced]: "Đã đổi sản phẩm/linh kiện mới",
	[WARRANTY_RESOLUTION_TYPE.refunded]: "Đã hoàn tiền",
	[WARRANTY_RESOLUTION_TYPE.no_fault_found]: "Kiểm tra không phát hiện lỗi",
	[WARRANTY_RESOLUTION_TYPE.rejected]: "Từ chối bảo hành",
};

/** Khách chỉ được tự hủy claim khi còn "pending" — mirror đúng rule ở cancelMyWarrantyClaim() backend. */
export const canCancelWarrantyClaim = (status: WarrantyClaimStatus): boolean =>
	status === WARRANTY_CLAIM_STATUS.pending;
