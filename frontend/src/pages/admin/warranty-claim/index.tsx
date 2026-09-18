import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminTitle from "../../../components/admin-title";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Pagination from "../../../components/pagination";
import { CloseIcon, SearchIcon } from "../../../components/icons";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseEnumParam } from "../../../utils/searchParams";
import { formatDate } from "../../../utils";
import { useWarrantyClaimsQuery } from "../../../features/admin/warranty-claim/hooks";
import { WARRANTY_CLAIM_STATUS_LABEL } from "../../../features/admin/warranty-claim/utils";
import WarrantyClaimStatusBadge from "../../../features/admin/warranty-claim/components/warranty-claim-status-badge";
import WarrantyClaimDetailModal from "../../../features/admin/warranty-claim/components/warranty-claim-detail-modal";
import type { WarrantyClaimStatus } from "../../../shared/constants/warranty";

const PAGE_SIZE = 10;

/**
 * Trang quản trị yêu cầu bảo hành. Route "/admin/warranty-claims" được bảo vệ bởi
 * requirePermissionLoader(permissions.warrantyClaim.manage), khớp với toàn bộ endpoint
 * GET/PATCH /warranty-claims/admin/* ở backend (warranty_claim:manage).
 */
const AdminWarrantyClaimPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } =
		useListQueryParams({
			defaultLimit: PAGE_SIZE,
		});

	const status = parseEnumParam<WarrantyClaimStatus>(searchParams, "status");
	const { data, isLoading, isFetching } = useWarrantyClaimsQuery({ page, limit, search, status });

	const [viewingClaimId, setViewingClaimId] = useState<number | null>(null);

	const claims = data?.data ?? [];
	const pagination = data?.pagination;

	// Tự động mở modal chi tiết nếu vào trang này TỪ 1 THÔNG BÁO (bấm ở chuông admin) và bộ lọc
	// "search" (backend search theo claimNumber HOẶC tên/email khách, xem warranty-claim.service.ts)
	// chỉ ra ĐÚNG 1 kết quả — vì backend luôn tạo actionUrl bằng claimNumber (unique) nên trường
	// hợp còn lại (0 hoặc >1 kết quả) không nên tự mở gì cả. CHỈ áp dụng khi đến từ notification
	// (location.state.fromNotification), KHÔNG áp dụng khi admin tự gõ tìm kiếm thủ công — nếu
	// không, mỗi lần search ra đúng 1 dòng modal sẽ tự bật lên, gây bất ngờ khó chịu ngoài ý muốn.
	// Xem notification-bell (admin) -> handleItemClick, và pages/admin/order/index.tsx (cùng pattern).
	const location = useLocation();
	const navigate = useNavigate();

	const fromNotification = Boolean((location.state as { fromNotification?: boolean } | null)?.fromNotification);
	const notificationClaim = fromNotification && claims.length === 1 ? claims[0] : null;

	const activeClaimId = viewingClaimId ?? notificationClaim?.id ?? null;

	const handleCloseModal = () => {
		setViewingClaimId(null);
		if (fromNotification) {
			navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
		}
	};

	return (
		<div className='space-y-6'>
			<AdminTitle title='Yêu cầu bảo hành' description='Xem và xử lý các yêu cầu bảo hành do khách hàng gửi.' />

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo mã claim, tên hoặc email khách...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={searchParams.get("status") ?? ""}
					onChange={(e) => setFilter("status", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={Object.entries(WARRANTY_CLAIM_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
				/>
				{hasActiveFilters(["status"]) && (
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
							<th className='px-5 py-3.5'>Mã claim</th>
							<th className='px-5 py-3.5'>Sản phẩm</th>
							<th className='px-5 py-3.5'>Khách hàng</th>
							<th className='px-5 py-3.5'>Ngày gửi</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
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
						) : claims.length === 0 ? (
							<tr>
								<td colSpan={6} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy yêu cầu bảo hành nào.
								</td>
							</tr>
						) : (
							claims.map((claim) => (
								<tr
									key={claim.id}
									className='cursor-pointer border-b border-border last:border-0 hover:bg-cream-soft/60'
									onClick={() => setViewingClaimId(claim.id)}>
									<td className='px-5 py-3.5 font-semibold text-ink'>{claim.claimNumber}</td>
									<td className='px-5 py-3.5 text-ink/80'>{claim.orderItem.productSku?.product?.name ?? "—"}</td>
									<td className='px-5 py-3.5'>
										<p className='text-ink/80'>{claim.user.name}</p>
										<p className='text-xs text-muted'>{claim.user.email}</p>
									</td>
									<td className='px-5 py-3.5 text-ink/70'>{formatDate(claim.createdAt ?? "")}</td>
									<td className='px-5 py-3.5'>
										<WarrantyClaimStatusBadge status={claim.status} />
									</td>
									<td className='px-5 py-3.5 text-right text-xs font-semibold text-primary-dark'>Xem chi tiết</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{activeClaimId !== null && <WarrantyClaimDetailModal claimId={activeClaimId} onClose={handleCloseModal} />}
		</div>
	);
};

export default AdminWarrantyClaimPage;
