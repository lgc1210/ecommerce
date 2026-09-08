import { useEffect, useRef, useState } from "react";
import { useMessagesQuery, useSendMessageMutation, useConversationRoom } from "../../message/hooks";
import { formatMessageTime } from "../../message/utils";
import { useAuth } from "../../../auth/hooks/useAuth";
import { CloseIcon, SendIcon } from "../../../../components/icons";
import Button from "../../../../components/button";
import type { ConversationStatus } from "../types";
import { CONVERSATION_STATUS_LABEL } from "../constants";
import FormControl from "../../../../components/form-control";

interface ChatPanelProps {
	conversationId: number;
	status: ConversationStatus;
	onClose: () => void;
	onStartNew: () => void;
}

const ChatPanel = ({ conversationId, status, onClose, onStartNew }: ChatPanelProps) => {
	const { user } = useAuth();
	const {
		data: messages = [],
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useMessagesQuery(conversationId);
	const sendMessage = useSendMessageMutation(conversationId);
	useConversationRoom(conversationId);
	const isOpenStatus = status === "open";

	const [draft, setDraft] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);
	const isFirstLoadRef = useRef(true);

	useEffect(() => {
		if (messages.length === 0) return;
		if (isFirstLoadRef.current) {
			bottomRef.current?.scrollIntoView({ behavior: "auto" });
			isFirstLoadRef.current = false;
			return;
		}
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const handleSend = () => {
		const content = draft.trim();
		if (!content || sendMessage.isPending) return;
		sendMessage.mutate({ content });
		setDraft("");
	};

	const orderedMessages = [...messages].reverse();

	return (
		<div className='flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl'>
			<div className='flex items-center justify-between border-b border-border bg-ink px-4 py-3 text-cream'>
				<p className='text-sm font-semibold'>Hỗ trợ khách hàng</p>
				<Button
					type='button'
					size='sm'
					variant='dark'
					onClick={onClose}
					aria-label='Đóng khung chat'
					title='Đóng khung chat'
					className='rounded-full! px-2!'>
					<CloseIcon className='h-4.5 w-4.5' />
				</Button>
			</div>

			<div className='flex-1 space-y-3 overflow-y-auto px-4 py-3'>
				{hasNextPage && (
					<div className='flex justify-center'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className='text-xs font-medium bg-transparent! text-primary hover:underline cursor-pointer disabled:opacity-50'>
							{isFetchingNextPage ? "Đang tải..." : "Xem tin nhắn cũ hơn"}
						</Button>
					</div>
				)}

				{isLoading && <p className='text-center text-sm text-muted'>Đang tải...</p>}
				{!isLoading && orderedMessages.length === 0 && (
					<p className='text-center text-sm text-muted'>Gửi tin nhắn để bắt đầu trò chuyện với shop nhé.</p>
				)}

				{orderedMessages.map((message) => {
					const isOwn = message.senderId === user?.id;
					return (
						<div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${isOwn ? "bg-primary text-white" : "bg-cream-soft text-ink"}`}>
								{!isOwn && <p className='mb-0.5 text-xs font-semibold text-primary-dark'>{message.sender.name}</p>}
								<p className='whitespace-pre-wrap wrap-break-words'>{message.content}</p>
								<p className={`mt-1 text-right text-[10px] ${isOwn ? "text-white/70" : "text-muted"}`}>
									{formatMessageTime(message.createdAt)}
								</p>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>

			{/* MỚI — nhánh else khi hội thoại đã resolved/closed */}
			{isOpenStatus ? (
				<div className='flex items-center gap-2 border-t border-border p-3'>
					<FormControl
						type='text'
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder='Nhập tin nhắn...'
						wrapperClassName='w-full!'
						className='h-10! rounded-full! text-sm'
					/>
					<Button
						type='button'
						size='sm'
						className='h-10! w-10! rounded-full! p-0! shrink-0'
						disabled={!draft.trim() || sendMessage.isPending}
						onClick={handleSend}
						aria-label='Gửi tin nhắn'
						icon={<SendIcon className='h-4 w-4' />}
					/>
				</div>
			) : (
				<div className='space-y-2 border-t border-border p-3 text-center'>
					<p className='text-xs text-muted'>
						Cuộc trò chuyện này đã {CONVERSATION_STATUS_LABEL[status]?.toLowerCase()} — không thể nhắn thêm.
					</p>
					<Button type='button' size='sm' className='w-full' onClick={onStartNew}>
						Bắt đầu cuộc trò chuyện mới
					</Button>
				</div>
			)}
		</div>
	);
};

export default ChatPanel;
