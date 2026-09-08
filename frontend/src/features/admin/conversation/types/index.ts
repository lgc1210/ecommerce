export type ConversationStatus = "open" | "resolved" | "closed";

export interface ConversationParticipant {
	id: number;
	name: string;
	email: string;
}

export interface Conversation {
	id: number;
	customerId: number;
	assignedStaffId: number | null;
	status: ConversationStatus;
	customerLastReadMessageId: number | null;
	staffLastReadMessageId: number | null;
	createdAt: string;
	updatedAt: string;
	customer: ConversationParticipant;
	assignedStaff: ConversationParticipant | null;
}

export interface ListConversationsParams {
	page?: number;
	limit?: number;
	status?: ConversationStatus;
	assignedStaffId?: number | "unassigned";
}

export interface ListConversationsResult {
	data: Conversation[];
	meta: { total: number; page: number; limit: number; totalPages: number };
}
