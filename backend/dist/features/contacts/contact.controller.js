import contactService from "./contact.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
// ==========================================
// Public
// ==========================================
export const createContact = async (req, res, next) => {
    try {
        const userId = req.user?.id ?? null;
        const contact = await contactService.createContact(userId, req.body);
        res.status(201).json({ message: "Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.", data: contact });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Self-service
// ==========================================
export const listOwnContacts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await contactService.listOwnContacts(userId, req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Admin
// ==========================================
export const listContacts = async (req, res, next) => {
    try {
        const result = await contactService.listContacts(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const getContactById = async (req, res, next) => {
    try {
        const contactId = Number(req.params.id);
        const contact = await contactService.getContactById(contactId);
        res.status(200).json({ data: contact });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const updateContactStatus = async (req, res, next) => {
    try {
        const contactId = Number(req.params.id);
        const contact = await contactService.updateContactStatus(contactId, req.body.status);
        res.status(200).json({ message: "Cập nhật trạng thái liên hệ thành công.", data: contact });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const deleteContact = async (req, res, next) => {
    try {
        const contactId = Number(req.params.id);
        await contactService.deleteContact(contactId);
        res.status(200).json({ message: "Xóa liên hệ thành công." });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=contact.controller.js.map