import type { WarrantyClaimStatus, WarrantyResolutionType } from "../../../../shared/constants/warranty";
import type { Pagination } from "../../../../types";

/** 1 sản phẩm đã mua còn đủ điều kiện gửi claim (GET /warranty-claims/warrantable-items). */
export interface WarrantableOrderItem {
	orderItemId: number;
	orderId: number;
	orderNumber: string;
	quantity: number;
	product: { id: number; name: string; slug: string } | null;
	productImage: string | null;
	trackSerial: boolean;
	/** Chỉ có ý nghĩa khi trackSerial=true — danh sách serial thuộc CHÍNH orderItem này để khách chọn. */
	productUnits: { id: number; serialNumber: string }[];
	warrantyPolicy: { id: number; name: string };
	warrantyStartAt: string;
	warrantyEndAt: string;
	isWithinWarranty: boolean;
}

export interface CreateWarrantyClaimPayload {
	orderItemId: number;
	issueDescription: string;
	imageUrls?: string[];
	productUnitId?: number;
}

export interface MyWarrantyClaimProductSummary {
	id: number;
	name: string;
	slug: string;
}

export interface MyWarrantyClaimOrderItemSummary {
	id: number;
	quantity: number;
	productSku: {
		id: number;
		sku: string;
		product: MyWarrantyClaimProductSummary | null;
	} | null;
}

/** 1 claim nhìn từ danh sách của chính khách (GET /warranty-claims/me). */
export interface MyWarrantyClaim {
	id: number;
	claimNumber: string;
	orderItemId: number;
	warrantyStartAt: string;
	warrantyEndAt: string;
	issueDescription: string;
	imageUrls: string[] | null;
	status: WarrantyClaimStatus;
	resolutionType: WarrantyResolutionType | null;
	repairFee: string | null;
	staffNote: string | null;
	slaDueAt: string | null;
	createdAt: string | null;
	resolvedAt: string | null;
	orderItem: MyWarrantyClaimOrderItemSummary;
	warrantyPolicy: { id: number; name: string } | null;
}

export interface MyWarrantyClaimStatusLogEntry {
	id: number;
	fromStatus: WarrantyClaimStatus | null;
	toStatus: WarrantyClaimStatus;
	note: string | null;
	createdAt: string | null;
}

/** Chi tiết 1 claim của chính khách (GET /warranty-claims/me/id/:id) — thêm statusLogs (không có
 * actionByUser — backend chỉ trả tên staff xử lý ở phía admin, không lộ cho khách). */
export interface MyWarrantyClaimDetail extends MyWarrantyClaim {
	productUnit: { id: number; serialNumber: string } | null;
	statusLogs: MyWarrantyClaimStatusLogEntry[];
}

export interface ListMyWarrantyClaimsParams {
	page?: number;
	limit?: number;
	status?: WarrantyClaimStatus;
}

export interface ListMyWarrantyClaimsResult {
	data: MyWarrantyClaim[];
	pagination: Pagination;
}

export interface UploadClaimImageResult {
	url: string;
	filename: string;
}
