import { z } from "zod";
export declare const ListMessagesSchema: z.ZodObject<{
    params: z.ZodObject<{
        conversationId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        beforeId: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const SendMessageSchema: z.ZodObject<{
    params: z.ZodObject<{
        conversationId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<{
            system: "system";
            text: "text";
            image: "image";
        }>>;
        content: z.ZodOptional<z.ZodString>;
        attachmentUrl: z.ZodOptional<z.ZodURL>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=message.validation.d.ts.map