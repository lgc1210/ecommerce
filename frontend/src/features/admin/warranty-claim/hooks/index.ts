import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	AdminWarrantyClaimDetail,
	ListWarrantyClaimsAdminParams,
	ListWarrantyClaimsAdminResult,
	UpdateWarrantyClaimStatusPayload,
} from "../types";
import warrantyClaimAdminService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_WARRANTY_CLAIMS_QUERY_KEY = ["admin", "warranty-claims"] as const;

export const useWarrantyClaimsQuery = (params: ListWarrantyClaimsAdminParams) => {
	return useQuery<ListWarrantyClaimsAdminResult>({
		queryKey: [...ADMIN_WARRANTY_CLAIMS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await warrantyClaimAdminService.getWarrantyClaims(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useWarrantyClaimDetailQuery = (id: number | null) => {
	return useQuery<{ data: AdminWarrantyClaimDetail }>({
		queryKey: [...ADMIN_WARRANTY_CLAIMS_QUERY_KEY, "detail", id],
		queryFn: async () => {
			const res = await warrantyClaimAdminService.getWarrantyClaimById(id!);
			return res.data;
		},
		enabled: id !== null,
	});
};

export const useUpdateWarrantyClaimStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateWarrantyClaimStatusPayload) =>
			warrantyClaimAdminService.updateWarrantyClaimStatus(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_WARRANTY_CLAIMS_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật trạng thái yêu cầu bảo hành thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật trạng thái thất bại."));
		},
	});
};
