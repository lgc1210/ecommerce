import type { WarrantyClaimStatus, WarrantyResolutionType } from "../../../../shared/constants/warranty";
import type { Pagination } from "../../../../types";

export interface WarrantyClaimCustomer {
	id: number;
	name: string;
	email: string;
	phone: string | null;
}

export interface WarrantyClaimProductSummary {
	id: number;
	name: string;
	slug: string;
}

export interface WarrantyClaimOrderItemSummary {
	id: number;
	quantity: number;
	priceAtPurchase: string;
	productSku: {
		id: number;
		sku: string;
		product: WarrantyClaimProductSummary | null;
	} | null;
}

export interface WarrantyClaimStatusLogEntry {
	id: number;
	fromStatus: WarrantyClaimStatus | null;
	toStatus: WarrantyClaimStatus;
	note: string | null;
	createdAt: string | null;
	actionByUser: { id: number; name: string };
}

/** 1 claim nhìn từ danh sách admin (GET /warranty-claims/admin). */
export interface AdminWarrantyClaim {
	id: number;
	claimNumber: string;
	orderItemId: number;
	userId: number;
	warrantyPolicyId: number | null;
	warrantyStartAt: string;
	warrantyEndAt: string;
	issueDescription: string;
	imageUrls: string[] | null;
	productUnitId: number | null;
	status: WarrantyClaimStatus;
	resolutionType: WarrantyResolutionType | null;
	/** Decimal ở backend -> serialize thành string qua JSON. */
	repairFee: string | null;
	staffNote: string | null;
	handledByUserId: number | null;
	slaDueAt: string | null;
	createdAt: string | null;
	resolvedAt: string | null;
	user: WarrantyClaimCustomer;
	orderItem: WarrantyClaimOrderItemSummary;
	warrantyPolicy: { id: number; name: string } | null;
}

/** Chi tiết 1 claim (GET /warranty-claims/admin/id/:id) — có thêm handledBy, productUnit, statusLogs. */
export interface AdminWarrantyClaimDetail extends AdminWarrantyClaim {
	handledBy: { id: number; name: string } | null;
	productUnit: { id: number; serialNumber: string } | null;
	statusLogs: WarrantyClaimStatusLogEntry[];
}

export interface ListWarrantyClaimsAdminParams {
	page?: number;
	limit?: number;
	status?: WarrantyClaimStatus;
	search?: string;
}

export interface ListWarrantyClaimsAdminResult {
	data: AdminWarrantyClaim[];
	pagination: Pagination;
}

export interface UpdateWarrantyClaimStatusPayload {
	id: number;
	status: Exclude<WarrantyClaimStatus, "pending">;
	staffNote?: string;
	resolutionType?: WarrantyResolutionType;
	repairFee?: number;
}
