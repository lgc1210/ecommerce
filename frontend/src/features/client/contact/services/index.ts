import apiClient from "../../../../configs/apis";
import type { ContactPayload } from "../types";

const contactService = {
	/** Gửi liên hệ công khai. Không yêu cầu đăng nhập (POST /contacts không có authenticateJWT ở backend). */
	send: (payload: ContactPayload) => apiClient.post("/contacts", payload),
	/** Danh sách liên hệ do chính user hiện tại đã gửi trước đó (yêu cầu đăng nhập). */
	getMy: (params: { page?: number; limit?: number } = {}) => apiClient.get("/contacts/me", { params }),
};

export default contactService;
