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

/** Đăng ký email ở trang chủ để nhận mã giảm giá chào mừng đơn hàng đầu tiên. */
export const useRequestWelcomeCouponMutation = () => {
	return useMutation({
		mutationFn: (email: string) => couponService.requestWelcomeCoupon(email),
		onSuccess: () => {
			toast.success("Đã gửi mã giảm giá đến email của bạn, hãy kiểm tra hộp thư nhé!");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể đăng ký nhận mã giảm giá, vui lòng thử lại."));
		},
	});
};
