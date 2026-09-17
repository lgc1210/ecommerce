import apiClient from "../../../../configs/apis";
import type { CreateWarrantyPolicyPayload, ListWarrantyPoliciesParams, UpdateWarrantyPolicyPayload } from "../types";

const warrantyPolicyService = {
	getWarrantyPolicies: (params: ListWarrantyPoliciesParams = {}) =>
		apiClient.get("/warranty-policies", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
			},
		}),
	createWarrantyPolicy: (payload: CreateWarrantyPolicyPayload) => apiClient.post("/warranty-policies", payload),
	updateWarrantyPolicy: ({ id, ...payload }: UpdateWarrantyPolicyPayload) =>
		apiClient.patch(`/warranty-policies/id/${id}`, payload),
	deleteWarrantyPolicy: (id: number) => apiClient.delete(`/warranty-policies/id/${id}`),
};

export default warrantyPolicyService;
