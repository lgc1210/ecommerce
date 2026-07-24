import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import meService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";
import { AUTH_ME_QUERY_KEY } from "../../../auth/hooks/useAuth";
import type { CreateAddressPayload, UpdateAddressPayload, UpdateOwnProfilePayload, UserAddress } from "../types";

export const MY_ADDRESSES_QUERY_KEY = ["me", "addresses"] as const;

/**
 * Cập nhật hồ sơ (tên/SĐT) của chính user đang đăng nhập. Invalidate cache
 * "auth.me" để tên hiển thị trên header/avatar cập nhật ngay không cần reload.
 */
export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateOwnProfilePayload) => meService.updateProfile(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật hồ sơ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật hồ sơ thất bại."));
		},
	});
};

/** Sổ địa chỉ của chính user hiện tại, sắp xếp mặc định lên đầu (theo backend). */
export const useMyAddressesQuery = () => {
	return useQuery<UserAddress[]>({
		queryKey: MY_ADDRESSES_QUERY_KEY,
		queryFn: async () => {
			const res = await meService.getAddresses();
			return res.data.data as UserAddress[];
		},
	});
};

export const useCreateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateAddressPayload) => meService.createAddress(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_ADDRESSES_QUERY_KEY });
			toast.success(res.data.message ?? "Thêm địa chỉ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Thêm địa chỉ thất bại."));
		},
	});
};

export const useUpdateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateAddressPayload) => meService.updateAddress(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_ADDRESSES_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật địa chỉ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật địa chỉ thất bại."));
		},
	});
};

export const useSetDefaultAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: number) => meService.setDefaultAddress(addressId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_ADDRESSES_QUERY_KEY });
			toast.success(res.data.message ?? "Đặt địa chỉ mặc định thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đặt địa chỉ mặc định thất bại."));
		},
	});
};

export const useDeleteAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: number) => meService.deleteAddress(addressId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: MY_ADDRESSES_QUERY_KEY });
			toast.success(res.data.message ?? "Xóa địa chỉ thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa địa chỉ thất bại."));
		},
	});
};
