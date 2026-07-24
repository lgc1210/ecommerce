import apiClient from "../../../../configs/apis";
import type { CreateCouponPayload, ListCouponsParams, UpdateCouponPayload } from "../types";

const couponService = {
	getCoupons: (params: ListCouponsParams = {}) =>
		apiClient.get("/coupons", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
				isActive: params.isActive === undefined ? undefined : String(params.isActive),
				discountType: params.discountType || undefined,
			},
		}),
	createCoupon: (payload: CreateCouponPayload) => apiClient.post("/coupons", payload),
	updateCoupon: ({ id, ...payload }: UpdateCouponPayload) => apiClient.patch(`/coupons/id/${id}`, payload),
	deleteCoupon: (id: number) => apiClient.delete(`/coupons/id/${id}`),
};

export default couponService;
