export type MessageType = "text" | "image" | "system";

export interface MessageSender {
	id: number;
	name: string;
	email: string;
}

/** Khớp `messageSenderInclude` ở backend (message.service.ts). */
export interface Message {
	id: number;
	conversationId: number;
	senderId: number;
	type: MessageType;
	content: string | null;
	attachmentUrl: string | null;
	createdAt: string;
	sender: MessageSender;
}

export interface SendMessagePayload {
	type?: MessageType;
	content?: string;
	attachmentUrl?: string;
}
