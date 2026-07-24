import type { ADDRESS_TYPE } from "./user.const.js";

type AddressType = (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE];

export interface AddressInput {
	addressType?: AddressType;
	recipientName: string;
	phoneNumber: string;
	addressLine: string;
	ward: string;
	province: string;
	isDefault?: boolean;
}

export interface AddressUpdateInput {
	addressType?: AddressType;
	recipientName?: string;
	phoneNumber?: string;
	addressLine?: string;
	ward?: string;
	province?: string;
	isDefault?: boolean;
}

export interface ListUsersParams {
	page?: string;
	limit?: string;
	search?: string;
	roleId?: string;
	isActive?: string;
}
