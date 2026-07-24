import apiClient from "../../../../configs/apis";
import type { CreateAddressPayload, UpdateAddressPayload, UpdateOwnProfilePayload } from "../types";

/**
 * Toàn bộ endpoint self-service ("của chính user đang đăng nhập"), mount tại
 * "/api/users" (xem backend user.routes.ts phần "Self-service").
 */
const meService = {
	updateProfile: async (payload: UpdateOwnProfilePayload) => apiClient.patch("/users/me", payload),

	getAddresses: async () => apiClient.get("/users/me/addresses"),
	createAddress: async (payload: CreateAddressPayload) => apiClient.post("/users/me/addresses", payload),
	updateAddress: async ({ addressId, ...payload }: UpdateAddressPayload) =>
		apiClient.patch(`/users/me/addresses/${addressId}`, payload),
	setDefaultAddress: async (addressId: number) => apiClient.patch(`/users/me/addresses/${addressId}/default`),
	deleteAddress: async (addressId: number) => apiClient.delete(`/users/me/addresses/${addressId}`),
};

export default meService;
