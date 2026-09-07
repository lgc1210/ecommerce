export type ConversationStatus = "open" | "resolved" | "closed";

export interface ConversationParticipant {
	id: number;
	name: string;
	email: string;
}

/** Khớp `conversationDetailInclude` ở backend (conversation.service.ts). */
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
