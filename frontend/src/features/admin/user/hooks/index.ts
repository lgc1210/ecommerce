import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateUserPayload,
	ListUsersParams,
	ListUsersResult,
	UpdateUserRolePayload,
	UpdateUserStatusPayload,
} from "../types";
import userService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

/** Danh sách user có phân trang/tìm kiếm/lọc theo role & trạng thái, dùng cho bảng quản trị user. */
export const useUsersQuery = (params: ListUsersParams) => {
	return useQuery<ListUsersResult>({
		queryKey: [...ADMIN_USERS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await userService.getUsers(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/**
 * Admin tạo tài khoản trực tiếp cho nhân viên (không qua form đăng ký công khai).
 * Backend không đặt mật khẩu hộ — tự động gửi email OTP "quên mật khẩu" để nhân
 * viên tự đặt mật khẩu lần đầu, nên không cần (và không nên) hỏi mật khẩu ở form này.
 */
export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateUserPayload) => userService.createUser(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo tài khoản thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo tài khoản thất bại."));
		},
	});
};

/**
 * Đổi role cho 1 user (vd. thăng cấp customer -> manager). Invalidate cả danh sách
 * user để cập nhật lại tên role hiển thị trên bảng ngay sau khi đổi thành công.
 */
export const useUpdateUserRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateUserRolePayload) => userService.updateUserRole(payload),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
			toast.success(response.data.message ?? "Cập nhật role người dùng thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật role người dùng thất bại."));
		},
	});
};

/** Kích hoạt/vô hiệu hóa tài khoản user. */
export const useUpdateUserStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateUserStatusPayload) => userService.updateUserStatus(payload),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
			toast.success(response.data.message ?? "Cập nhật trang thái người dùng thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật trang thái người dùng thất bại."));
		},
	});
};
