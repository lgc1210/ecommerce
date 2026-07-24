export type AddressType = "shipping" | "billing";

/** Địa chỉ giao hàng/thanh toán của chính user hiện tại (GET/POST/PATCH /users/me/addresses). */
export interface UserAddress {
	id: number;
	userId: number;
	addressType: AddressType;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	ward: string;
	province: string;
	isDefault: boolean;
	createdAt?: string;
}

export interface UpdateOwnProfilePayload {
	name?: string;
	phone?: string;
}

export interface CreateAddressPayload {
	addressType?: AddressType;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	ward: string;
	province: string;
	isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
	addressId: number;
}
