import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useOwnConversationQuery, useOwnConversationRealtimeSync, useStartOwnConversationMutation } from "../hooks";
import { getSocket } from "../../../../realtime/socket-client";
import { ChatIcon, CloseIcon } from "../../../../components/icons";
import ChatPanel from "./chat-panel";
import type { Message } from "../../message/types";
import Button from "../../../../components/button";

const ChatWidget = () => {
	const { isAuthenticated, user } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [hasUnread, setHasUnread] = useState(false);

	const { data: conversation } = useOwnConversationQuery(isAuthenticated);
	const startConversation = useStartOwnConversationMutation();
	const conversationId = conversation?.id ?? null;
	useOwnConversationRealtimeSync(conversationId);

	useEffect(() => {
		if (!conversationId) return;

		const socket = getSocket();
		socket.emit("join_conversation", conversationId);

		const handleNewMessage = (message: Message) => {
			if (message.conversationId !== conversationId || message.senderId === user?.id) return;
			if (!isOpen) setHasUnread(true);
		};

		socket.on("new_message", handleNewMessage);
		return () => {
			socket.off("new_message", handleNewMessage);
		};
	}, [conversationId, user?.id, isOpen]);

	if (!isAuthenticated) return null;

	const handleToggle = () => {
		if (isOpen) {
			setIsOpen(false);
			return;
		}
		setHasUnread(false);
		// Thêm điều kiện conversation?.status !== "open" (khách bấm lại sau khi hội thoại trước đã kết thúc)
		if (!conversationId || conversation?.status !== "open") startConversation.mutate();
		setIsOpen(true);
	};

	return (
		<div className='fixed bottom-18 right-4 z-40 flex flex-col items-end gap-3'>
			{isOpen && (
				<div className='h-112 w-88 max-w-[calc(100vw-3rem)]'>
					{conversationId && conversation ? (
						<ChatPanel
							conversationId={conversationId}
							status={conversation.status}
							onClose={() => setIsOpen(false)}
							onStartNew={() => startConversation.mutate()}
						/>
					) : (
						<div className='flex h-full items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted shadow-xl'>
							Đang mở khung chat...
						</div>
					)}
				</div>
			)}

			<Button
				type='button'
				onClick={handleToggle}
				disabled={startConversation.isPending}
				aria-label={isOpen ? "Đóng khung chat" : "Mở khung chat hỗ trợ"}
				className='relative px-3! flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 disabled:opacity-60'>
				{isOpen ? <CloseIcon className='h-5 w-5' /> : <ChatIcon className='h-5 w-5' />}
				{hasUnread && !isOpen && (
					<span className='absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white' />
				)}
			</Button>
		</div>
	);
};

export default ChatWidget;
