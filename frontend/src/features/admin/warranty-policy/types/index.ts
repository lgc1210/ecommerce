import type { DurationUnit, WarrantyProviderType } from "../../../../shared/constants/warranty";
import type { Pagination } from "../../../../types";

export interface AdminWarrantyPolicy {
	id: number;
	name: string;
	durationValue: number;
	durationUnit: DurationUnit;
	warrantyType: WarrantyProviderType;
	exchangePeriodValue: number | null;
	exchangePeriodUnit: DurationUnit | null;
	description: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	/** Chỉ list trả `products`; chi tiết 1 policy (getById) trả thêm cả `claims`. */
	_count: { products: number; claims?: number };
}

export interface ListWarrantyPoliciesParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface ListWarrantyPoliciesResult {
	data: AdminWarrantyPolicy[];
	pagination: Pagination;
}

export interface CreateWarrantyPolicyPayload {
	name: string;
	durationValue: number;
	durationUnit: DurationUnit;
	warrantyType: WarrantyProviderType;
	exchangePeriodValue?: number | null;
	exchangePeriodUnit?: DurationUnit | null;
	description?: string;
}

export interface UpdateWarrantyPolicyPayload extends Partial<CreateWarrantyPolicyPayload> {
	id: number;
}
