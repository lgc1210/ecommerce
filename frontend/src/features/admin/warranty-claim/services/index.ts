import apiClient from "../../../../configs/apis";
import type { ListWarrantyClaimsAdminParams, UpdateWarrantyClaimStatusPayload } from "../types";

const warrantyClaimAdminService = {
	getWarrantyClaims: (params: ListWarrantyClaimsAdminParams = {}) =>
		apiClient.get("/warranty-claims/admin", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
				search: params.search || undefined,
			},
		}),
	getWarrantyClaimById: (id: number) => apiClient.get(`/warranty-claims/admin/id/${id}`),
	updateWarrantyClaimStatus: ({ id, ...payload }: UpdateWarrantyClaimStatusPayload) =>
		apiClient.patch(`/warranty-claims/admin/id/${id}/status`, payload),
};

export default warrantyClaimAdminService;
