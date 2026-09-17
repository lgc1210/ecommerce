import { useState } from "react";
import AdminTitle from "../../../components/admin-title";
import Button from "../../../components/button";
import FormControl from "../../../components/form-control";
import Popup from "../../../components/popup";
import Pagination from "../../../components/pagination";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import {
	useWarrantyPoliciesQuery,
	useCreateWarrantyPolicy,
	useUpdateWarrantyPolicy,
	useDeleteWarrantyPolicy,
} from "../../../features/admin/warranty-policy/hooks";
import type {
	AdminWarrantyPolicy,
	CreateWarrantyPolicyPayload,
	UpdateWarrantyPolicyPayload,
} from "../../../features/admin/warranty-policy/types";
import { WARRANTY_PROVIDER_TYPE_LABEL, formatDuration } from "../../../features/admin/warranty-policy/utils";
import WarrantyPolicyFormModal from "../../../features/admin/warranty-policy/components/warranty-policy-form-modal";

const PAGE_SIZE = 10;

/**
 * Trang quản trị chính sách bảo hành. Route "/admin/warranty-policies" được bảo vệ bởi
 * requirePermissionLoader(permissions.warrantyPolicy.manage), khớp với backend: toàn bộ endpoint
 * GET/POST/PATCH/DELETE /warranty-policies đều yêu cầu "warranty_policy:manage" — chỉ 1 tầng
 * quyền duy nhất nên trang này không cần bọc thêm <Can> cho từng nút.
 */
const AdminWarrantyPolicyPage = () => {
	const { page, limit, search, searchInput, setSearchInput } = useListQueryParams({ defaultLimit: PAGE_SIZE });

	const { data, isLoading, isFetching } = useWarrantyPoliciesQuery({ page, limit, search });
	const createPolicy = useCreateWarrantyPolicy();
	const updatePolicy = useUpdateWarrantyPolicy();
	const deletePolicy = useDeleteWarrantyPolicy();

	const [formState, setFormState] = useState<{ policy?: AdminWarrantyPolicy } | null>(null);
	const [deletingPolicy, setDeletingPolicy] = useState<AdminWarrantyPolicy | null>(null);

	const policies = data?.data ?? [];
	const pagination = data?.pagination;

	const handleSubmitForm = (payload: CreateWarrantyPolicyPayload | UpdateWarrantyPolicyPayload) => {
		if (formState?.policy) {
			updatePolicy.mutate(payload as UpdateWarrantyPolicyPayload, { onSuccess: () => setFormState(null) });
		} else {
			createPolicy.mutate(payload as CreateWarrantyPolicyPayload, { onSuccess: () => setFormState(null) });
		}
	};

	const handleConfirmDelete = () => {
		if (!deletingPolicy) return;
		deletePolicy.mutate(deletingPolicy.id, { onSuccess: () => setDeletingPolicy(null) });
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Chính sách bảo hành' description='Quản lý các gói bảo hành để gán cho sản phẩm.' />
				<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={() => setFormState({})}>
					Thêm chính sách
				</Button>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo tên chính sách...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-200 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Tên chính sách</th>
							<th className='px-5 py-3.5'>Thời hạn</th>
							<th className='px-5 py-3.5'>Đổi mới 1-đổi-1</th>
							<th className='px-5 py-3.5'>Chịu trách nhiệm</th>
							<th className='px-5 py-3.5'>Sản phẩm áp dụng</th>
							<th className='px-5 py-3.5' />
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : policies.length === 0 ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Chưa có chính sách bảo hành nào.
								</td>
							</tr>
						) : (
							policies.map((policy) => (
								<tr key={policy.id} className='border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5'>
										<p className='font-semibold text-ink'>{policy.name}</p>
										{policy.description && (
											<p className='mt-0.5 line-clamp-1 text-xs text-muted'>{policy.description}</p>
										)}
									</td>
									<td className='px-5 py-3.5 text-ink/80'>
										{formatDuration(policy.durationValue, policy.durationUnit)}
									</td>
									<td className='px-5 py-3.5 text-ink/70'>
										{policy.exchangePeriodValue != null && policy.exchangePeriodUnit
											? formatDuration(policy.exchangePeriodValue, policy.exchangePeriodUnit)
											: "—"}
									</td>
									<td className='px-5 py-3.5 text-ink/70'>{WARRANTY_PROVIDER_TYPE_LABEL[policy.warrantyType]}</td>
									<td className='px-5 py-3.5 text-ink/70'>{policy._count.products}</td>
									<td className='px-5 py-3.5'>
										<div className='flex items-center justify-end gap-1.5'>
											<button
												type='button'
												onClick={() => setFormState({ policy })}
												className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream-soft hover:text-ink'
												title='Sửa'>
												<PencilIcon className='h-4 w-4' />
											</button>
											<button
												type='button'
												disabled={policy._count.products > 0}
												onClick={() => setDeletingPolicy(policy)}
												className='flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted cursor-pointer'
												title={policy._count.products > 0 ? "Đang có sản phẩm áp dụng, hãy gỡ trước khi xóa" : "Xóa"}>
												<TrashIcon className='h-4 w-4' />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{formState && (
				<WarrantyPolicyFormModal
					policy={formState.policy}
					onClose={() => setFormState(null)}
					onSubmit={handleSubmitForm}
					isSubmitting={createPolicy.isPending || updatePolicy.isPending}
				/>
			)}

			{deletingPolicy && (
				<Popup
					title='Xóa chính sách bảo hành'
					description={`Bạn có chắc muốn xóa chính sách "${deletingPolicy.name}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa chính sách'
					isConfirming={deletePolicy.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingPolicy(null)}
				/>
			)}
		</div>
	);
};

export default AdminWarrantyPolicyPage;
