import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateWarrantyPolicyPayload,
	ListWarrantyPoliciesParams,
	ListWarrantyPoliciesResult,
	UpdateWarrantyPolicyPayload,
} from "../types";
import warrantyPolicyService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_WARRANTY_POLICIES_QUERY_KEY = ["admin", "warranty-policies"] as const;

export const useWarrantyPoliciesQuery = (params: ListWarrantyPoliciesParams) => {
	return useQuery<ListWarrantyPoliciesResult>({
		queryKey: [...ADMIN_WARRANTY_POLICIES_QUERY_KEY, params],
		queryFn: async () => {
			const res = await warrantyPolicyService.getWarrantyPolicies(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useCreateWarrantyPolicy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateWarrantyPolicyPayload) => warrantyPolicyService.createWarrantyPolicy(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_WARRANTY_POLICIES_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo chính sách bảo hành thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo chính sách bảo hành thất bại."));
		},
	});
};

export const useUpdateWarrantyPolicy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateWarrantyPolicyPayload) => warrantyPolicyService.updateWarrantyPolicy(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_WARRANTY_POLICIES_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật chính sách bảo hành thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật chính sách bảo hành thất bại."));
		},
	});
};

/** Backend chặn xóa (409) nếu policy đang được gán cho sản phẩm hoặc đã từng dùng trong claim — message đó hiển thị thẳng qua toast. */
export const useDeleteWarrantyPolicy = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => warrantyPolicyService.deleteWarrantyPolicy(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_WARRANTY_POLICIES_QUERY_KEY });
			toast.success(res.data.message ?? "Xóa chính sách bảo hành thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa chính sách bảo hành thất bại."));
		},
	});
};
