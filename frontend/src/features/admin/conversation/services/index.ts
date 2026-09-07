import apiClient from "../../../../configs/apis";
import type { Conversation, ConversationStatus, ListConversationsParams, ListConversationsResult } from "../types";

const conversationService = {
	getConversations: (params: ListConversationsParams = {}) =>
		apiClient.get<ListConversationsResult>("/conversations", {
			params: {
				page: params.page,
				limit: params.limit,
				status: params.status || undefined,
				assignedStaffId: params.assignedStaffId,
			},
		}),

	getConversationById: (id: number) => apiClient.get<{ data: Conversation }>(`/conversations/${id}`),

	assignToSelf: (id: number) => apiClient.patch<{ data: Conversation }>(`/conversations/${id}/assign`),

	updateStatus: (id: number, status: ConversationStatus) =>
		apiClient.patch<{ data: Conversation }>(`/conversations/${id}/status`, { status }),

	markConversationRead: (id: number, lastReadMessageId: number) =>
		apiClient.patch(`/conversations/${id}/read`, { lastReadMessageId }),
};

export default conversationService;
