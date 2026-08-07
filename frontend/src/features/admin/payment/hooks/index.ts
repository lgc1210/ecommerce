import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import paymentService from "../services";
import type { ListPaymentsAdminParams, ListPaymentsAdminResult, UpdatePaymentStatusPayload } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_PAYMENTS_QUERY_KEY = ["admin", "payments"] as const;

export const usePaymentsAdminQuery = (params: ListPaymentsAdminParams) => {
	return useQuery<ListPaymentsAdminResult>({
		queryKey: [...ADMIN_PAYMENTS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await paymentService.getPayments(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useUpdatePaymentStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdatePaymentStatusPayload) => paymentService.updatePaymentStatus(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_QUERY_KEY });
			queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
			toast.success(res.data.message ?? "Cập nhật tràng thành cong.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Cập nhật tràng thất bại.")),
	});
};
