import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCouponPayload, ListCouponsParams, ListCouponsResult, UpdateCouponPayload } from "../types";
import couponService from "../services";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_COUPONS_QUERY_KEY = ["admin", "coupons"] as const;

export const useCouponsQuery = (params: ListCouponsParams) => {
	return useQuery<ListCouponsResult>({
		queryKey: [...ADMIN_COUPONS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await couponService.getCoupons(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useCreateCoupon = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateCouponPayload) => couponService.createCoupon(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo mã giảm giá thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo mã giảm giá thất bại."));
		},
	});
};

export const useUpdateCoupon = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateCouponPayload) => couponService.updateCoupon(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật má giảm giá thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật má giảm giá thất bại."));
		},
	});
};

/** Backend chặn xóa (409) nếu coupon đã từng được dùng trong đơn hàng, và gợi ý vô hiệu hóa (isActive=false) thay vì xóa — message đó hiển thị thẳng qua toast. */
export const useDeleteCoupon = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => couponService.deleteCoupon(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_QUERY_KEY });
			toast.success(res.data.message ?? "Xóa mã giảm giá thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa mã giảm giá thất bại."));
		},
	});
};
