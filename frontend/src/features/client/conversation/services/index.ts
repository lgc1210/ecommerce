import apiClient from "../../../../configs/apis";
import type { Conversation } from "../types";

const conversationService = {
	getOrCreateOwnConversation: () => apiClient.post<{ data: Conversation }>("/conversations/me"),

	getOwnCurrentConversation: () => apiClient.get<{ data: Conversation | null }>("/conversations/me"),

	markOwnConversationRead: (conversationId: number, lastReadMessageId: number) =>
		apiClient.patch(`/conversations/me/${conversationId}/read`, { lastReadMessageId }),
};

export default conversationService;
