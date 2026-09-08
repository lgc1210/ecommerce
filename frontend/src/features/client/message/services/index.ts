import apiClient from "../../../../configs/apis";
import type { Message, SendMessagePayload } from "../types";

const messageService = {
	listMessages: (conversationId: number, beforeId?: number) =>
		apiClient.get<{ data: Message[]; meta: { hasMore: boolean } }>(`/messages/${conversationId}`, {
			params: beforeId ? { beforeId } : undefined,
		}),
	sendMessage: (conversationId: number, payload: SendMessagePayload) =>
		apiClient.post<{ data: Message }>(`/messages/${conversationId}`, payload),
};

export default messageService;
