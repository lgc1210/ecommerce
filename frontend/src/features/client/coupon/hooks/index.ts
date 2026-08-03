import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import couponService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";

/**
 * Kiểm tra mã giảm giá lúc thanh toán. Không dùng useQuery vì đây là hành động chủ động ("Áp
 * dụng") theo yêu cầu người dùng, không phải dữ liệu cần tự fetch/refetch theo key.
 */
export const useValidateCouponMutation = () => {
	return useMutation({
		mutationFn: ({ code, orderSubtotal }: { code: string; orderSubtotal: number }) =>
			couponService.validateCoupon(code, orderSubtotal),
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Mã giảm giá không hợp lệ."));
		},
	});
};
