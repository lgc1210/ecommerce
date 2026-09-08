import { useState } from "react";
import { Tabs, TabItem } from "../../../../components/tabs";
import Button from "../../../../components/button";
import { useConversationsAdminQuery } from "../hooks";
import type { Conversation, ConversationStatus } from "../types";
import { CONVERSATION_STATUS_LABEL } from "../../../client/conversation/constants";
import FormCheckbox from "../../../../components/form-checkbox";

type StatusFilter = ConversationStatus | "all";

const statusBadgeClass: Record<ConversationStatus, string> = {
	open: "bg-amber-100 text-amber-700",
	resolved: "bg-emerald-100 text-emerald-700",
	closed: "bg-ink/10 text-muted",
};

interface ConversationListProps {
	selectedId: number | null;
	onSelect: (conversation: Conversation) => void;
}

const ConversationList = ({ selectedId, onSelect }: ConversationListProps) => {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
	const [onlyUnassigned, setOnlyUnassigned] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 20;

	const { data, isLoading } = useConversationsAdminQuery({
		page,
		limit,
		status: statusFilter === "all" ? undefined : statusFilter,
		assignedStaffId: onlyUnassigned ? "unassigned" : undefined,
	});

	const conversations = data?.data ?? [];
	const totalPages = data?.meta.totalPages ?? 1;

	return (
		<div className='flex h-full flex-col rounded-2xl border border-border bg-surface'>
			<div className='space-y-3 border-b border-border p-4'>
				<Tabs
					value={statusFilter}
					onChange={(value) => {
						setStatusFilter(value);
						setPage(1);
					}}>
					<TabItem value='all'>Tất cả</TabItem>
					<TabItem value='open'>Đang mở</TabItem>
					<TabItem value='resolved'>Đã xử lý</TabItem>
					<TabItem value='closed'>Đã đóng</TabItem>
				</Tabs>

				<FormCheckbox
					type='checkbox'
					checked={onlyUnassigned}
					onChange={(e) => {
						setOnlyUnassigned(e.target.checked);
						setPage(1);
					}}
					className='h-4 w-4 rounded border-border accent-primary'
					label='Chỉ hiện hội thoại chưa ai nhận'
				/>
			</div>

			<div className='flex-1 space-y-1.5 overflow-y-auto p-2'>
				{isLoading && <p className='p-4 text-center text-sm text-muted'>Đang tải...</p>}

				{!isLoading && conversations.length === 0 && (
					<p className='p-4 text-center text-sm text-muted'>Không có hội thoại nào.</p>
				)}

				{conversations.map((conversation) => (
					<button
						key={conversation.id}
						type='button'
						onClick={() => onSelect(conversation)}
						className={`w-full rounded-xl p-3 text-left transition-colors ${
							selectedId === conversation.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-cream-soft"
						}`}>
						<div className='flex items-center justify-between gap-2'>
							<p className='truncate text-sm font-semibold text-ink'>{conversation.customer.name}</p>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass[conversation.status]}`}>
								{CONVERSATION_STATUS_LABEL[conversation.status]}
							</span>
						</div>
						<p className='mt-0.5 truncate text-xs text-muted'>{conversation.customer.email}</p>
						<p className='mt-1 text-xs text-muted'>
							{conversation.assignedStaff ? `Đang phụ trách: ${conversation.assignedStaff.name}` : "Chưa ai nhận xử lý"}
						</p>
					</button>
				))}
			</div>

			{totalPages > 1 && (
				<div className='flex items-center justify-between border-t border-border p-3'>
					<Button type='button' variant='outline' size='sm' disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
						Trước
					</Button>
					<span className='text-xs text-muted'>
						Trang {page}/{totalPages}
					</span>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={page === totalPages}
						onClick={() => setPage((p) => p + 1)}>
						Sau
					</Button>
				</div>
			)}
		</div>
	);
};

export default ConversationList;
