import { z } from "zod";
export declare const ConversationIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const MarkOwnConversationReadSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        lastReadMessageId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const MarkStaffConversationReadSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        lastReadMessageId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AssignConversationSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateConversationStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodEnum<{
            resolved: "resolved";
            closed: "closed";
            open: "open";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListConversationsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            resolved: "resolved";
            closed: "closed";
            open: "open";
        }>>;
        assignedStaffId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"unassigned">]>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=conversation.validation.d.ts.map