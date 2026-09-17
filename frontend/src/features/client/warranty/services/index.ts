import apiClient from "../../../../configs/apis";
import type { CreateWarrantyClaimPayload, ListMyWarrantyClaimsParams } from "../types";

const warrantyClaimService = {
	getWarrantableOrderItems: () => apiClient.get("/warranty-claims/warrantable-items"),

	createWarrantyClaim: (payload: CreateWarrantyClaimPayload) => apiClient.post("/warranty-claims", payload),

	getMyWarrantyClaims: (params: ListMyWarrantyClaimsParams = {}) =>
		apiClient.get("/warranty-claims/me", {
			params: { page: params.page, limit: params.limit, status: params.status || undefined },
		}),

	getMyWarrantyClaimById: (id: number) => apiClient.get(`/warranty-claims/me/id/${id}`),

	cancelMyWarrantyClaim: (id: number) => apiClient.patch(`/warranty-claims/me/id/${id}/cancel`),

	// Cùng lý do set Content-Type thủ công như productService.uploadImage (xem chú thích ở đó) —
	// tránh axios tự JSON.stringify() FormData khi Content-Type mặc định của instance là "application/json".
	uploadClaimImage: (file: File) => {
		const formData = new FormData();
		formData.append("image", file);
		return apiClient.post("/uploads/warranty-claim-image", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},
};

export default warrantyClaimService;
