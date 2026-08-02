import type { ADDRESS_TAG } from "./user.const.js";

type AddressTag = (typeof ADDRESS_TAG)[keyof typeof ADDRESS_TAG];

export interface AddressInput {
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

export interface AddressUpdateInput {
	tag?: AddressTag;
	recipientName?: string;
	phoneNumber?: string;
	addressLine?: string;
	wardName?: string;
	districtName?: string;
	provinceName?: string;
	provinceId?: number;
	districtId?: number;
	wardCode?: string;
	isDefault?: boolean;
}

export interface ListUsersParams {
	page?: string;
	limit?: string;
	search?: string;
	roleId?: string;
	isActive?: string;
}
