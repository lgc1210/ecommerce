import apiClient from "../../../../configs/apis";
import type { ListPaymentsAdminParams, UpdatePaymentStatusPayload } from "../types";

const paymentService = {
	getPayments: (params: ListPaymentsAdminParams = {}) =>
		apiClient.get("/payments/admin", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
				method: params.method || undefined,
				search: params.search || undefined,
				dateFrom: params.dateFrom || undefined,
				dateTo: params.dateTo || undefined,
			},
		}),
	updatePaymentStatus: ({ id, status, transactionId }: UpdatePaymentStatusPayload) => apiClient.patch(`/payments/admin/${id}/status`, { status, transactionId: transactionId || undefined }),
};

export default paymentService;
