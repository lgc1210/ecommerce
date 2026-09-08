import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import conversationService from "../services";
import type { ConversationStatus, ListConversationsParams, ListConversationsResult } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { getSocket } from "../../../../realtime/socket-client";
import { useSupportInboxStore } from "../stores";

export const CONVERSATIONS_ADMIN_QUERY_KEY = ["admin", "conversations"] as const;

export const useConversationsAdminQuery = (params: ListConversationsParams) => {
	return useQuery<ListConversationsResult>({
		queryKey: [...CONVERSATIONS_ADMIN_QUERY_KEY, params],
		queryFn: () => conversationService.getConversations(params).then((res) => res.data),
		placeholderData: keepPreviousData,
	});
};

export const useConversationDetailQuery = (conversationId: number | null) => {
	return useQuery({
		queryKey: [...CONVERSATIONS_ADMIN_QUERY_KEY, "detail", conversationId ?? -1],
		queryFn: () => conversationService.getConversationById(conversationId!),
		select: (res) => res.data.data,
		enabled: conversationId !== null,
	});
};

export const useAssignConversationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: number) => conversationService.assignToSelf(conversationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_ADMIN_QUERY_KEY });
			toast.success("Đã nhận xử lý hội thoại.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể nhận xử lý hội thoại."));
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_ADMIN_QUERY_KEY });
		},
	});
};

export const useUpdateConversationStatusMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ conversationId, status }: { conversationId: number; status: ConversationStatus }) =>
			conversationService.updateStatus(conversationId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CONVERSATIONS_ADMIN_QUERY_KEY });
			toast.success("Đã cập nhật trạng thái hội thoại.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái hội thoại."));
		},
	});
};

export const useMarkConversationReadMutation = () => {
	return useMutation({
		mutationFn: ({ conversationId, lastReadMessageId }: { conversationId: number; lastReadMessageId: number }) =>
			conversationService.markConversationRead(conversationId, lastReadMessageId),
	});
};

export const useConversationInboxRealtimeSync = (): void => {
	const queryClient = useQueryClient();
	useEffect(() => {
		const socket = getSocket();
		const refresh = () => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_ADMIN_QUERY_KEY });
		socket.on("conversation:created", refresh);
		socket.on("conversation:updated", refresh);
		socket.on("conversation:new_message", refresh);
		return () => {
			socket.off("conversation:created", refresh);
			socket.off("conversation:updated", refresh);
			socket.off("conversation:new_message", refresh);
		};
	}, [queryClient]);
};

// MỚI — toàn bộ hàm này
export const useSupportInboxNotifications = (): void => {
	const markNewActivity = useSupportInboxStore((state) => state.markNewActivity);
	useEffect(() => {
		const socket = getSocket();
		socket.on("conversation:created", markNewActivity);
		socket.on("conversation:new_message", markNewActivity);
		return () => {
			socket.off("conversation:created", markNewActivity);
			socket.off("conversation:new_message", markNewActivity);
		};
	}, [markNewActivity]);
};
