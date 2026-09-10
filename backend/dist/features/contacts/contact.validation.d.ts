import { z } from "zod";
export declare const CreateContactSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
        subject: z.ZodOptional<z.ZodString>;
        message: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListOwnContactsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListContactsQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            new: "new";
            in_progress: "in_progress";
            resolved: "resolved";
            closed: "closed";
        }>>;
        search: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ContactIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateContactStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        status: z.ZodEnum<{
            new: "new";
            in_progress: "in_progress";
            resolved: "resolved";
            closed: "closed";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>["body"];
export type ListOwnContactsParams = z.infer<typeof ListOwnContactsQuerySchema>["query"];
export type ListContactsParams = z.infer<typeof ListContactsQuerySchema>["query"];
export type UpdateContactStatusInput = z.infer<typeof UpdateContactStatusSchema>["body"];
//# sourceMappingURL=contact.validation.d.ts.map