import apiClient from "../../../../configs/apis";
import type { ValidateCouponResult, RequestWelcomeCouponResult } from "../types";

const couponService = {
	/**
	 * Kiểm tra + tính số tiền được giảm cho 1 mã giảm giá (POST /coupons/validate), dùng ở trang
	 * thanh toán khi khách nhập mã. Không tự áp dụng gì ở backend — chỉ trả về số tiền giảm dự
	 * kiến; mã chỉ thực sự được dùng khi gửi kèm `couponCode` trong POST /orders lúc đặt hàng.
	 */
	validateCoupon: (code: string, orderSubtotal: number) =>
		apiClient.post<{ data: ValidateCouponResult }>("/coupons/validate", { code, orderSubtotal }),

	/**
	 * Đăng ký email ở trang chủ để nhận mã giảm giá chào mừng đơn hàng đầu tiên (POST
	 * /coupons/request-welcome). Public — không yêu cầu đăng nhập.
	 */
	requestWelcomeCoupon: (email: string) =>
		apiClient.post<{ message: string; data: RequestWelcomeCouponResult }>("/coupons/request-welcome", { email }),
};

export default couponService;
