import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListContactsParams, ListContactsResult, UpdateContactStatusPayload } from "../types";
import contactService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_CONTACTS_QUERY_KEY = ["admin", "contacts"] as const;

/** Danh sách liên hệ có phân trang/tìm kiếm/lọc theo trạng thái, dùng cho bảng quản trị Contact. */
export const useContactsQuery = (params: ListContactsParams) => {
	return useQuery<ListContactsResult>({
		queryKey: [...ADMIN_CONTACTS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await contactService.getContacts(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Đổi trạng thái xử lý 1 liên hệ (vd. "new" -> "in_progress"). Backend chỉ chấp
 * nhận một số bước chuyển hợp lệ (xem contact.utils.ts:isValidContactStatusTransition)
 * và trả lỗi 400 nếu chuyển sai bước, message lỗi đó được hiển thị trực tiếp qua toast.
 */
export const useUpdateContactStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateContactStatusPayload) => contactService.updateContactStatus(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật trang thái liên hệ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật trang thái liên hệ thất bại."));
		},
	});
};

export const useDeleteContact = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => contactService.deleteContact(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
			toast.success(res.data.message ?? "Xoá liên hệ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xoá liên hệ thất bại."));
		},
	});
};
