import apiClient from "../../../../configs/apis";
import type { ListContactsParams, UpdateContactStatusPayload } from "../types";

const contactService = {
	getContacts: (params: ListContactsParams = {}) =>
		apiClient.get("/contacts", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
				search: params.search || undefined,
				userId: params.userId,
			},
		}),
	updateContactStatus: ({ id, status }: UpdateContactStatusPayload) =>
		apiClient.patch(`/contacts/${id}/status`, { status }),
	deleteContact: (id: number) => apiClient.delete(`/contacts/${id}`),
};

export default contactService;
