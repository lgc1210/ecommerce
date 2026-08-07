import prisma from "../../config/prisma.js";
import type { ContactStatus } from "../../generated/prisma/index.js";
import { parsePagination } from "../../utils/index.js";
import { isValidContactStatusTransition } from "./contact.utils.js";

interface CreateContactInput {
	name: string;
	email: string;
	subject?: string;
	message: string;
}

interface ListOwnContactsParams {
	page?: string;
	limit?: string;
}

interface ListContactsParams {
	page?: string;
	limit?: string;
	status?: string;
	search?: string;
	userId?: string;
}

const contactWithUserInclude = {
	user: { select: { id: true, name: true, email: true } },
};

class ContactService {
	// ==========================================
	// Public
	// ==========================================
	/** userId = null nếu khách gửi liên hệ mà chưa đăng nhập (guest submission) */
	async createContact(userId: number | null, data: CreateContactInput) {
		return prisma.contact.create({
			data: {
				userId: userId ?? null,
				name: data.name,
				email: data.email,
				subject: data.subject ?? null,
				message: data.message,
			},
		});
	}

	// ==========================================
	// Self-service
	// ==========================================
	async listOwnContacts(userId: number, params: ListOwnContactsParams) {
		const { page, limit, skip } = parsePagination(params);

		const [contacts, total] = await Promise.all([
			prisma.contact.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.contact.count({ where: { userId } }),
		]);

		return {
			data: contacts,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	// ==========================================
	// Admin
	// ==========================================
	async listContacts(params: ListContactsParams) {
		const where: Record<string, unknown> = {};

		if (params.status) where.status = params.status;
		if (params.userId) where.userId = Number(params.userId);
		if (params.search) {
			where.OR = [{ name: { contains: params.search } }, { email: { contains: params.search } }, { subject: { contains: params.search } }];
		}

		const { page, limit, skip } = parsePagination(params);
		const [contacts, total] = await Promise.all([
			prisma.contact.findMany({
				where,
				include: contactWithUserInclude,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.contact.count({ where }),
		]);

		return {
			data: contacts,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getContactById(contactId: number) {
		const contact = await prisma.contact.findUnique({ where: { id: contactId }, include: contactWithUserInclude });
		if (!contact) {
			throw new Error("NotFound: Liên hệ không tồn tại.");
		}
		return contact;
	}

	async updateContactStatus(contactId: number, status: ContactStatus) {
		const contact = await this.getContactOrThrow(contactId);

		if (!isValidContactStatusTransition(contact.status as ContactStatus, status)) {
			throw new Error(`BadRequest: Không thể chuyển trạng thái từ "${contact.status}" sang "${status}".`);
		}

		return prisma.contact.update({ where: { id: contactId }, data: { status }, include: contactWithUserInclude });
	}

	async deleteContact(contactId: number) {
		await this.getContactOrThrow(contactId);
		await prisma.contact.delete({ where: { id: contactId } });
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async getContactOrThrow(contactId: number) {
		const contact = await prisma.contact.findUnique({ where: { id: contactId } });
		if (!contact) {
			throw new Error("NotFound: Liên hệ không tồn tại.");
		}
		return contact;
	}
}

export default new ContactService();
