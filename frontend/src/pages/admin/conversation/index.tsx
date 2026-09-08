import { useEffect, useState } from "react";
import AdminTitle from "../../../components/admin-title";
import ConversationList from "../../../features/admin/conversation/components/conversation-list";
import ConversationChatPanel from "../../../features/admin/conversation/components/conversation-chat-panel";
import { useConversationInboxRealtimeSync } from "../../../features/admin/conversation/hooks";
import { useSupportInboxStore } from "../../../features/admin/conversation/stores";
import { ChatIcon } from "../../../components/icons";

const AdminConversationPage = () => {
	const [selectedId, setSelectedId] = useState<number | null>(null);
	useConversationInboxRealtimeSync();

	const clearNewActivity = useSupportInboxStore((state) => state.clearNewActivity);
	useEffect(() => {
		clearNewActivity();
	}, [clearNewActivity]);

	return (
		<div className='flex h-[calc(100vh-8rem)] flex-col'>
			<AdminTitle
				title='Hỗ trợ khách hàng'
				description='Danh sách hội thoại chat với khách hàng — bất kỳ ai có quyền đều xem/trả lời được mọi hội thoại.'
			/>
			<div className='mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[22rem_1fr]'>
				<div className='min-h-0'>
					<ConversationList selectedId={selectedId} onSelect={(conversation) => setSelectedId(conversation.id)} />
				</div>
				<div className='min-h-0'>
					{selectedId ? (
						<ConversationChatPanel conversationId={selectedId} />
					) : (
						<div className='flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted'>
							<ChatIcon className='h-8 w-8' />
							<p className='text-sm'>Chọn 1 hội thoại ở danh sách bên trái để xem chi tiết.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminConversationPage;
