import { useMutation, useQuery } from "@tanstack/react-query";
import contactService from "../services";
import type { ContactPayload, MyContactsResult } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const MY_CONTACTS_QUERY_KEY = ["client", "contacts", "me"] as const;

/** Gửi form liên hệ (trang /contact, không cần đăng nhập). */
export const useSendContact = () => {
	return useMutation({
		mutationFn: (payload: ContactPayload) => contactService.send(payload),
		onSuccess: (res) => {
			toast.success(res.data.message ?? "Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.");
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err, "Gửi liên hệ thất bại."));
		},
	});
};

/** Danh sách liên hệ đã gửi của chính user hiện tại, dùng cho tab "Liên hệ của tôi" ở trang tài khoản. */
export const useMyContactsQuery = (params: { page?: number; limit?: number } = {}) => {
	return useQuery<MyContactsResult>({
		queryKey: [...MY_CONTACTS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await contactService.getMy(params);
			return res.data;
		},
	});
};
