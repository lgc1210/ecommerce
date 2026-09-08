import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import conversationService from "../services";
import { OWN_CONVERSATION_QUERY_KEY } from "../constants";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { useEffect } from "react";
import { getSocket } from "../../../../realtime/socket-client";
import type { Conversation } from "../types";

export const useOwnConversationQuery = (enabled: boolean) => {
	return useQuery({
		queryKey: OWN_CONVERSATION_QUERY_KEY,
		queryFn: () => conversationService.getOwnCurrentConversation(),
		select: (res) => res.data.data,
		enabled,
	});
};

export const useStartOwnConversationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => conversationService.getOrCreateOwnConversation(),
		onSuccess: (res) => {
			queryClient.setQueryData(OWN_CONVERSATION_QUERY_KEY, res);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể mở hội thoại hỗ trợ, vui lòng thử lại."));
		},
	});
};

export const useMarkOwnConversationReadMutation = () => {
	return useMutation({
		mutationFn: ({ conversationId, lastReadMessageId }: { conversationId: number; lastReadMessageId: number }) =>
			conversationService.markOwnConversationRead(conversationId, lastReadMessageId),
	});
};

export const useOwnConversationRealtimeSync = (conversationId: number | null): void => {
	const queryClient = useQueryClient();
	useEffect(() => {
		if (conversationId === null) return;
		const socket = getSocket();
		if (!socket) return;

		const handleUpdated = (updated: Conversation) => {
			if (updated.id !== conversationId) return;
			queryClient.invalidateQueries({ queryKey: OWN_CONVERSATION_QUERY_KEY });
		};

		socket.on("conversation:updated", handleUpdated);
		return () => {
			socket.off("conversation:updated", handleUpdated);
		};
	}, [conversationId, queryClient]);
};
