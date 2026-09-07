import { useEffect, useRef, useState } from "react";
import { useMessagesQuery, useSendMessageMutation, useConversationRoom } from "../../../client/message/hooks";
import { formatMessageTime } from "../../../client/message/utils";
import { useAuth } from "../../../auth/hooks/useAuth";
import { SendIcon } from "../../../../components/icons";
import Button from "../../../../components/button";
import FormSelect from "../../../../components/form-select";
import {
	useAssignConversationMutation,
	useUpdateConversationStatusMutation,
	useMarkConversationReadMutation,
	useConversationDetailQuery,
} from "../hooks";
import { CONVERSATION_STATUS_LABEL } from "../../../client/conversation/constants";
import type { ConversationStatus } from "../types";
import FormControl from "../../../../components/form-control";

interface ConversationChatPanelProps {
	conversationId: number;
}

const ConversationChatPanel = ({ conversationId }: ConversationChatPanelProps) => {
	const { user } = useAuth();
	const { data: conversation, isLoading: isLoadingConversation } = useConversationDetailQuery(conversationId);
	const {
		data: messages = [],
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useMessagesQuery(conversationId);
	const sendMessage = useSendMessageMutation(conversationId);
	useConversationRoom(conversationId);

	const assignToSelf = useAssignConversationMutation();
	const updateStatus = useUpdateConversationStatusMutation();
	const markRead = useMarkConversationReadMutation();

	const [draft, setDraft] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);
	const isFirstLoadRef = useRef(true);

	useEffect(() => {
		if (messages.length === 0) return;
		bottomRef.current?.scrollIntoView({ behavior: isFirstLoadRef.current ? "auto" : "smooth" });
		isFirstLoadRef.current = false;
	}, [messages.length]);

	useEffect(() => {
		isFirstLoadRef.current = true;
		if (messages.length > 0) {
			markRead.mutate({ conversationId, lastReadMessageId: messages[0].id });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversationId, messages[0]?.id]);

	const handleSend = () => {
		const content = draft.trim();
		if (!content || sendMessage.isPending) return;
		sendMessage.mutate({ content });
		setDraft("");
	};

	if (isLoadingConversation || !conversation) {
		return (
			<div className='flex h-full items-center justify-center rounded-2xl border border-border bg-surface text-sm text-muted'>
				Đang tải...
			</div>
		);
	}

	const orderedMessages = [...messages].reverse();
	const isAssignedToMe = conversation.assignedStaffId === user?.id;

	return (
		<div className='flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface'>
			<div className='space-y-3 border-b border-border p-4'>
				<div className='flex items-center justify-between gap-3'>
					<div>
						<p className='font-semibold text-ink'>{conversation.customer.name}</p>
						<p className='text-xs text-muted'>{conversation.customer.email}</p>
					</div>
					{!conversation.assignedStaffId && (
						<Button
							type='button'
							size='sm'
							disabled={assignToSelf.isPending}
							onClick={() => assignToSelf.mutate(conversation.id)}>
							{assignToSelf.isPending ? "Đang nhận..." : "Nhận xử lý"}
						</Button>
					)}
				</div>

				<div className='flex items-center justify-between gap-3'>
					<p className='text-xs text-muted'>
						{conversation.assignedStaffId ? (
							<>
								Phụ trách: <span className='font-medium text-ink'>{conversation.assignedStaff?.name}</span>
								{!isAssignedToMe && " (không phải bạn — vẫn có thể trả lời)"}
							</>
						) : (
							"Chưa ai nhận xử lý"
						)}
					</p>

					<FormSelect
						size='sm'
						value={conversation.status}
						disabled={updateStatus.isPending}
						onChange={(e) =>
							updateStatus.mutate({ conversationId: conversation.id, status: e.target.value as ConversationStatus })
						}
						options={(["open", "resolved", "closed"] as ConversationStatus[]).map((status) => ({
							value: status,
							label: CONVERSATION_STATUS_LABEL[status],
						}))}
					/>
				</div>
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
					<p className='text-center text-sm text-muted'>Chưa có tin nhắn nào.</p>
				)}

				{orderedMessages.map((message) => {
					const isOwn = message.senderId === user?.id;
					return (
						<div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${isOwn ? "bg-primary text-white" : "bg-cream-soft text-ink"}`}>
								<p className={`mb-0.5 text-xs font-semibold ${isOwn ? "text-white/80" : "text-primary-dark"}`}>
									{message.sender.name}
								</p>
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

			{/* MỚI — nhánh else khi hội thoại không phải "open" */}
			{conversation.status === "open" ? (
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
						placeholder='Nhập tin nhắn trả lời khách...'
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
				<div className='border-t border-border p-3 text-center text-xs text-muted'>
					Hội thoại đã "{CONVERSATION_STATUS_LABEL[conversation.status]}" — đổi trạng thái về "Đang mở" ở phía trên để
					nhắn tiếp.
				</div>
			)}
		</div>
	);
};

export default ConversationChatPanel;
