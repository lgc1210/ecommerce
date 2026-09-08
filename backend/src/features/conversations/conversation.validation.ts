import { z } from "zod";
import { ConversationStatus } from "../../generated/prisma/index.js";
import { numericIdString } from "../../shared/validation.js";

const conversationStatusEnum = z.enum([
	ConversationStatus.open,
	ConversationStatus.resolved,
	ConversationStatus.closed,
]);

export const ConversationIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const MarkOwnConversationReadSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({ lastReadMessageId: numericIdString }),
});

export const MarkStaffConversationReadSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({ lastReadMessageId: numericIdString }),
});

export const AssignConversationSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const UpdateConversationStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({ status: conversationStatusEnum }),
});

export const ListConversationsQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: conversationStatusEnum.optional(),
		// "unassigned" = lọc riêng các hội thoại chưa ai nhận; nếu không thì phải là id staff hợp lệ
		assignedStaffId: z.union([numericIdString, z.literal("unassigned")]).optional(),
	}),
});
