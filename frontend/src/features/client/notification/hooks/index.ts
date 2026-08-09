import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import notificationService from "../services";
import type { ListMyNotificationsParams, ListMyNotificationsResult } from "../types";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";
import { useAuth } from "../../../auth/hooks/useAuth";

export const MY_NOTIFICATIONS_QUERY_KEY = ["client", "notifications", "me"] as const;

/**
 * Danh sách thông báo — dùng cho cả dropdown chuông (limit nhỏ) lẫn tab "Quản lý thông báo".
 * `refetchInterval` để `undefined` (mặc định — không polling) khi dùng cho tab quản lý, vì tab
 * đó user đang thao tác trực tiếp (đọc, xóa) nên không cần tự làm mới; dropdown chuông cần
 * polling vì luôn nằm sẵn trên header, không có sự kiện nào của user để tự invalidate khi có
 * thông báo mới phát sinh từ phía server (đặt hàng, đổi trạng thái đơn, ...).
 */
export const useMyNotificationsQuery = (params: ListMyNotificationsParams = {}, options: { refetchInterval?: number } = {}) => {
	const { isAuthenticated } = useAuth();

	return useQuery<ListMyNotificationsResult>({
		queryKey: [...MY_NOTIFICATIONS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await notificationService.getMy(params);
			return res.data;
		},
		enabled: isAuthenticated,
		placeholderData: keepPreviousData,
		refetchInterval: options.refetchInterval,
	});
};

export const useMarkNotificationAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => notificationService.markAsRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể đánh dấu đã đọc."));
		},
	});
};

export const useMarkAllNotificationsAsRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificationService.markAllAsRead(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể đánh dấu tất cả đã đọc."));
		},
	});
};

/** Xóa hẳn 1 thông báo (tab "Quản lý thông báo" — dropdown ở header không cho xóa). */
export const useDeleteNotification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => notificationService.remove(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
			toast.success("Đã xóa thông báo.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa thông báo thất bại."));
		},
	});
};

/** Xóa toàn bộ thông báo đã đọc cùng lúc (nút "Xóa thông báo đã đọc" ở tab "Quản lý thông báo"). */
export const useDeleteAllReadNotifications = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificationService.removeAllRead(),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
			toast.success(res.data.message ?? "Đã xóa các thông báo đã đọc.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa thông báo đã đọc thất bại."));
		},
	});
};
