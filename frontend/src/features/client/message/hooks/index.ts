import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import messageService from "../services";
import type { Message, SendMessagePayload } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { getSocket } from "../../../../realtime/socket-client";

export const MESSAGES_QUERY_KEY = (conversationId: number) => ["client", "messages", conversationId] as const;

/**
 * Lịch sử tin nhắn của 1 hội thoại, phân trang theo cursor `beforeId` (khớp BE
 * message.service.ts -> listMessages). Mỗi "page" BE trả về mới nhất trước (orderBy id desc) —
 * giữ nguyên thứ tự đó trong cache, component hiển thị tự đảo ngược khi render.
 */
export const useMessagesQuery = (conversationId: number | null) => {
	return useInfiniteQuery({
		queryKey: MESSAGES_QUERY_KEY(conversationId ?? -1),
		queryFn: ({ pageParam }) => messageService.listMessages(conversationId!, pageParam ?? undefined),
		initialPageParam: undefined as number | undefined,
		getNextPageParam: (lastPage) => {
			if (!lastPage.data.meta.hasMore) return undefined;
			const lastMessage = lastPage.data.data[lastPage.data.data.length - 1];
			return lastMessage?.id;
		},
		enabled: conversationId !== null,
		select: (data) => data.pages.flatMap((page) => page.data.data),
	});
};

export const useSendMessageMutation = (conversationId: number | null) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: SendMessagePayload) => messageService.sendMessage(conversationId!, payload),
		onSuccess: (res) => {
			appendMessageToCache(queryClient, conversationId!, res.data.data);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể gửi tin nhắn, vui lòng thử lại."));
		},
	});
};

/** Thêm 1 tin nhắn vào ĐẦU page đầu tiên trong cache — bỏ qua nếu đã tồn tại (tránh nhân đôi giữa REST và socket echo). */
function appendMessageToCache(
	queryClient: ReturnType<typeof useQueryClient>,
	conversationId: number,
	message: Message,
) {
	queryClient.setQueryData(
		MESSAGES_QUERY_KEY(conversationId),
		(
			old: { pages: { data: { data: Message[]; meta: { hasMore: boolean } } }[]; pageParams: unknown[] } | undefined,
		) => {
			if (!old) {
				return { pages: [{ data: { data: [message], meta: { hasMore: false } } }], pageParams: [undefined] };
			}
			const firstPage = old.pages[0];
			if (firstPage.data.data.some((m) => m.id === message.id)) return old;

			const nextPages = [
				{ ...firstPage, data: { ...firstPage.data, data: [message, ...firstPage.data.data] } },
				...old.pages.slice(1),
			];
			return { ...old, pages: nextPages };
		},
	);
}

/** Join room "conversation:{id}" ngay khi mở 1 hội thoại, lắng nghe tin nhắn mới realtime, tự leave khi đổi hội thoại/unmount. */
export const useConversationRoom = (conversationId: number | null): void => {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (conversationId === null) return;

		const socket = getSocket();

		const handleNewMessage = (message: Message) => {
			if (message.conversationId !== conversationId) return;
			appendMessageToCache(queryClient, conversationId, message);
		};
		const joinRoom = () => {
			socket.emit("join_conversation", conversationId);
		};

		socket.on("new_message", handleNewMessage);
		socket.on("connect", joinRoom);
		joinRoom();

		return () => {
			socket.emit("leave_conversation", conversationId);
			socket.off("new_message", handleNewMessage);
			socket.off("connect", joinRoom);
		};
	}, [conversationId, queryClient]);
};
