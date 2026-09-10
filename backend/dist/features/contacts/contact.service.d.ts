import type { ContactStatus } from "../../generated/prisma/index.js";
import type { CreateContactInput, ListContactsParams, ListOwnContactsParams } from "./contact.validation.js";
declare class ContactService {
    /** userId = null nếu khách gửi liên hệ mà chưa đăng nhập (guest submission) */
    createContact(userId: number | null, data: CreateContactInput): Promise<{
        message: string;
        email: string;
        subject: string | null;
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        status: import("../../generated/prisma/index.js").$Enums.ContactStatus;
    }>;
    listOwnContacts(userId: number, params: ListOwnContactsParams): Promise<{
        data: {
            message: string;
            email: string;
            subject: string | null;
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            status: import("../../generated/prisma/index.js").$Enums.ContactStatus;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listContacts(params: ListContactsParams): Promise<{
        data: ({
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
        } & {
            message: string;
            email: string;
            subject: string | null;
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            status: import("../../generated/prisma/index.js").$Enums.ContactStatus;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getContactById(contactId: number): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        message: string;
        email: string;
        subject: string | null;
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        status: import("../../generated/prisma/index.js").$Enums.ContactStatus;
    }>;
    updateContactStatus(contactId: number, status: ContactStatus): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
        } | null;
    } & {
        message: string;
        email: string;
        subject: string | null;
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        status: import("../../generated/prisma/index.js").$Enums.ContactStatus;
    }>;
    deleteContact(contactId: number): Promise<void>;
    private getContactOrThrow;
}
declare const _default: ContactService;
export default _default;
//# sourceMappingURL=contact.service.d.ts.map