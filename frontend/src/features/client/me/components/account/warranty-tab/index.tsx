import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMyWarrantyClaimsQuery, useWarrantableOrderItemsQuery } from "../../../../warranty/hooks";
import WarrantyClaimFormModal from "../../../../warranty/components/warranty-claim-form-modal";
import WarrantyClaimDetailModal from "../../../../warranty/components/warranty-claim-detail-modal";
import WarrantyClaimStatusBadge from "../../../../warranty/components/warranty-claim-status-badge";
import WarrantyTabSkeleton from "./skeleton";
import Button from "../../../../../../components/button";
import Pagination from "../../../../../../components/pagination";
import { ShieldCheckIcon } from "../../../../../../components/icons";
import { formatDate } from "../../../../../../utils";
import type { WarrantableOrderItem } from "../../../../warranty/types";

const FALLBACK_IMAGE = "https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=San+pham";
const PAGE_SIZE = 10;

interface WarrantyTabProps {
	/** Claim cần mở sẵn chi tiết ngay khi tab này mount (vd từ link "Xem chi tiết" của 1 thông báo). */
	initialSelectedClaimId?: number | null;
}

/**
 * Tab "Bảo hành" trong trang tài khoản, gồm 2 phần — mirror cấu trúc ReviewsTab:
 * 1. Sản phẩm đủ điều kiện bảo hành — order_item đã giao, còn trong hạn, có gán WarrantyPolicy
 *    (GET /warranty-claims/warrantable-items).
 * 2. Yêu cầu bảo hành của tôi — claim đã gửi, xem chi tiết/hủy được khi còn "pending"
 *    (GET /warranty-claims/me).
 */
const WarrantyTab = ({ initialSelectedClaimId = null }: WarrantyTabProps) => {
	const [searchParams] = useSearchParams();
	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || PAGE_SIZE;

	const { data: warrantableItems, isLoading: isLoadingWarrantable } = useWarrantableOrderItemsQuery();
	const { data: myClaimsData, isLoading: isLoadingMyClaims } = useMyWarrantyClaimsQuery({ page, limit });

	const [claimingItem, setClaimingItem] = useState<WarrantableOrderItem | null>(null);
	const [viewingClaimId, setViewingClaimId] = useState<number | null>(initialSelectedClaimId);
	const [syncedClaimId, setSyncedClaimId] = useState(initialSelectedClaimId);

	// Đồng bộ lại khi initialSelectedClaimId đổi trong lúc WarrantyTab ĐANG mount sẵn (không tự
	// remount) — vd đang xem chi tiết claim A, bấm 1 thông báo khác trỏ tới claim B từ dropdown
	// chuông (tab vẫn là "warranty", không đổi, nên không có lượt mount mới nào để useState init
	// lại tự chạy). So sánh trực tiếp trong thân component, không dùng useEffect (cùng lý do như
	// account.tsx/order-tab).
	if (initialSelectedClaimId !== syncedClaimId) {
		setSyncedClaimId(initialSelectedClaimId);
		if (initialSelectedClaimId !== null) {
			setViewingClaimId(initialSelectedClaimId);
		}
	}

	if (isLoadingWarrantable || isLoadingMyClaims) return <WarrantyTabSkeleton />;

	const myClaims = myClaimsData?.data ?? [];

	return (
		<div className='space-y-8'>
			{/* Sản phẩm đủ điều kiện bảo hành */}
			{warrantableItems && warrantableItems.length > 0 && (
				<div>
					<h3 className='mb-3 text-sm font-semibold text-ink'>Sản phẩm đủ điều kiện bảo hành</h3>
					<div className='space-y-3'>
						{warrantableItems.map((item) => (
							<div
								key={item.orderItemId}
								className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4'>
								<div className='flex items-center gap-3'>
									<img
										src={item.productImage ?? FALLBACK_IMAGE}
										alt={item.product?.name ?? "Sản phẩm"}
										className='h-14 w-14 shrink-0 rounded-lg object-cover'
									/>
									<div>
										<p className='line-clamp-1 font-medium text-ink'>{item.product?.name ?? "Sản phẩm"}</p>
										<p className='mt-0.5 text-xs text-muted'>
											Đơn {item.orderNumber} · {item.warrantyPolicy.name}
										</p>
										<p className='mt-0.5 text-xs font-medium text-primary-dark'>
											Bảo hành tới {formatDate(item.warrantyEndAt)}
										</p>
									</div>
								</div>
								<Button
									size='sm'
									icon={<ShieldCheckIcon className='h-4 w-4' />}
									iconPosition='left'
									onClick={() => setClaimingItem(item)}>
									Gửi yêu cầu bảo hành
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Yêu cầu bảo hành của tôi */}
			{myClaims.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
					<ShieldCheckIcon className='mx-auto mb-2 h-6 w-6 text-muted' />
					Bạn chưa gửi yêu cầu bảo hành nào.
				</div>
			) : (
				<div className='space-y-3'>
					<h3 className='text-sm font-semibold text-ink'>Yêu cầu bảo hành của tôi</h3>
					{myClaims.map((claim) => (
						<button
							key={claim.id}
							type='button'
							onClick={() => setViewingClaimId(claim.id)}
							className='flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:bg-cream-soft/60 cursor-pointer'>
							<div>
								<p className='font-semibold text-ink'>
									{claim.orderItem.productSku?.product?.name ?? "Sản phẩm không còn tồn tại"}
								</p>
								<div className='mt-1.5 flex flex-wrap items-center gap-2'>
									<span className='text-xs text-muted'>{claim.claimNumber}</span>
									{claim.createdAt && <span className='text-xs text-muted'>· {formatDate(claim.createdAt)}</span>}
								</div>
							</div>
							<WarrantyClaimStatusBadge status={claim.status} />
						</button>
					))}

					{myClaimsData && (
						<Pagination
							total={myClaimsData.pagination.total}
							defaultLimit={PAGE_SIZE}
							pageSizeOptions={[]}
							isLoading={isLoadingMyClaims}
						/>
					)}
				</div>
			)}

			{claimingItem && <WarrantyClaimFormModal item={claimingItem} onClose={() => setClaimingItem(null)} />}
			{viewingClaimId !== null && (
				<WarrantyClaimDetailModal claimId={viewingClaimId} onClose={() => setViewingClaimId(null)} />
			)}
		</div>
	);
};

export default WarrantyTab;
