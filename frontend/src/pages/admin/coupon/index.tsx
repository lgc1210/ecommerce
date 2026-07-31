import { useState } from "react";
import AdminTitle from "../../../components/admin-title";
import Button from "../../../components/button";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Popup from "../../../components/popup";
import Pagination from "../../../components/pagination";
import { CloseIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseBooleanParam, parseEnumParam } from "../../../utils/searchParams";
import { formatCurrency } from "../../../utils/currency";
import {
	useCouponsQuery,
	useCreateCoupon,
	useDeleteCoupon,
	useUpdateCoupon,
} from "../../../features/admin/coupon/hooks";
import type {
	AdminCoupon,
	CreateCouponPayload,
	DiscountType,
	UpdateCouponPayload,
} from "../../../features/admin/coupon/types";
import { DISCOUNT_TYPE_LABEL } from "../../../features/admin/coupon/utils";
import StatusBadge from "../../../features/admin/coupon/components/status-badge";
import CouponFormModal from "../../../features/admin/coupon/components/coupon-form-modal";
import { formatDate } from "../../../utils";

const formatDiscount = (coupon: AdminCoupon) =>
	coupon.discountType === "percentage"
		? `${Number(coupon.discountValue)}%`
		: formatCurrency(Number(coupon.discountValue));

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend, dẫn tới các trang
// "ảo" vượt quá dữ liệu thật (bấm vào sẽ trả về rỗng dù còn sản phẩm).
const PAGE_SIZE = 10;

/**
 * Trang quản trị Coupon. Route "/admin/coupon" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.coupon.manage), khớp với backend: toàn bộ
 * endpoint GET/POST/PATCH/DELETE /coupons (trừ "/validate" dành cho khách lúc
 * thanh toán) đều yêu cầu "coupon:manage" — chỉ 1 tầng quyền duy nhất nên trang
 * này không cần bọc thêm <Can> cho từng nút, vào được trang là có đủ quyền thao tác.
 */
const AdminCouponPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } =
		useListQueryParams({
			defaultLimit: PAGE_SIZE,
		});

	const isActive = parseBooleanParam(searchParams, "isActive");
	const discountType = parseEnumParam<DiscountType>(searchParams, "discountType");

	const { data, isLoading, isFetching } = useCouponsQuery({ page, limit, search, isActive, discountType });
	const createCoupon = useCreateCoupon();
	const updateCoupon = useUpdateCoupon();
	const deleteCoupon = useDeleteCoupon();

	const [formState, setFormState] = useState<{ coupon?: AdminCoupon } | null>(null);
	const [deletingCoupon, setDeletingCoupon] = useState<AdminCoupon | null>(null);

	const coupons = data?.data ?? [];
	const pagination = data?.pagination;

	const handleSubmitForm = (payload: CreateCouponPayload | UpdateCouponPayload) => {
		if (formState?.coupon) {
			updateCoupon.mutate(payload as UpdateCouponPayload, { onSuccess: () => setFormState(null) });
		} else {
			createCoupon.mutate(payload as CreateCouponPayload, { onSuccess: () => setFormState(null) });
		}
	};

	const handleConfirmDelete = () => {
		if (!deletingCoupon) return;
		deleteCoupon.mutate(deletingCoupon.id, { onSuccess: () => setDeletingCoupon(null) });
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Mã giảm giá' description='Quản lý mã giảm giá áp dụng cho đơn hàng.' />
				<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={() => setFormState({})}>
					Thêm mã giảm giá
				</Button>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo mã giảm giá...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={searchParams.get("isActive") ?? ""}
					onChange={(e) => setFilter("isActive", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={[
						{ value: "true", label: "Đang kích hoạt" },
						{ value: "false", label: "Đã vô hiệu hóa" },
					]}
				/>
				<FormSelect
					value={discountType ?? ""}
					onChange={(e) => setFilter("discountType", e.target.value || undefined)}
					placeholder='Tất cả loại giảm giá'
					options={Object.entries(DISCOUNT_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
				/>
				{hasActiveFilters(["isActive", "discountType"]) && (
					<button
						type='button'
						onClick={clearFilters}
						className='flex h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted transition-colors hover:text-ink cursor-pointer'>
						<CloseIcon className='h-4 w-4' />
						Xóa bộ lọc
					</button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-220 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Mã</th>
							<th className='px-5 py-3.5'>Giá trị giảm</th>
							<th className='px-5 py-3.5'>Đơn tối thiểu</th>
							<th className='px-5 py-3.5'>Thời gian hiệu lực</th>
							<th className='px-5 py-3.5'>Lượt dùng</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
							<th className='px-5 py-3.5' />
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={7} className='px-5 py-8 text-center text-muted'>
									Đang tải...
								</td>
							</tr>
						) : coupons.length === 0 ? (
							<tr>
								<td colSpan={7} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy mã giảm giá nào.
								</td>
							</tr>
						) : (
							coupons.map((coupon) => (
								<tr key={coupon.id} className='border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5'>
										<p className='font-semibold text-ink'>{coupon.code}</p>
										<p className='text-xs text-muted'>{DISCOUNT_TYPE_LABEL[coupon.discountType]}</p>
									</td>
									<td className='px-5 py-3.5 text-ink/80'>{formatDiscount(coupon)}</td>
									<td className='px-5 py-3.5 text-ink/70'>{formatCurrency(Number(coupon.minOrderValue))}</td>
									<td className='px-5 py-3.5 text-ink/70'>
										{formatDate(coupon.startsAt)} — {formatDate(coupon.expiresAt)}
									</td>
									<td className='px-5 py-3.5 text-ink/70'>
										{coupon.usedCount}/{coupon.usageLimit ?? "∞"}
									</td>
									<td className='px-5 py-3.5'>
										<StatusBadge coupon={coupon} />
									</td>
									<td className='px-5 py-3.5'>
										<div className='flex items-center justify-end gap-1.5'>
											<button
												type='button'
												onClick={() => setFormState({ coupon })}
												className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream-soft hover:text-ink'
												title='Sửa'>
												<PencilIcon className='h-4 w-4' />
											</button>
											<button
												type='button'
												disabled={coupon.usedCount > 0}
												onClick={() => setDeletingCoupon(coupon)}
												className='flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted cursor-pointer'
												title={
													coupon.usedCount > 0 ? "Đã được dùng trong đơn hàng, hãy vô hiệu hóa thay vì xóa" : "Xóa"
												}>
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
				<CouponFormModal
					coupon={formState.coupon}
					onClose={() => setFormState(null)}
					onSubmit={handleSubmitForm}
					isSubmitting={createCoupon.isPending || updateCoupon.isPending}
				/>
			)}

			{deletingCoupon && (
				<Popup
					title='Xóa mã giảm giá'
					description={`Bạn có chắc muốn xóa mã "${deletingCoupon.code}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa mã giảm giá'
					isConfirming={deleteCoupon.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingCoupon(null)}
				/>
			)}
		</div>
	);
};

export default AdminCouponPage;
