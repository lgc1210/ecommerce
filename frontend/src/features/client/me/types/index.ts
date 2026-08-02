export type AddressTag = "home" | "office";

/** Địa chỉ giao hàng/thanh toán của chính user hiện tại (GET/POST/PATCH /users/me/addresses). */
export interface UserAddress {
	id: number;
	userId: number;
	tag: AddressTag;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	wardName: string;
	districtName: string;
	provinceName: string;
	provinceId: number;
	districtId: number;
	wardCode: string;
	isDefault: boolean;
	createdAt?: string;
}

export interface UpdateOwnProfilePayload {
	name?: string;
	phone?: string;
}

export interface CreateAddressPayload {
	tag?: AddressTag;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	wardName: string;
	districtName: string;
	provinceName: string;
	provinceId: number;
	districtId: number;
	wardCode: string;
	isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
	addressId: number;
}
