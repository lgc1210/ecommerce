import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ModalShell from "../../../../components/modal-shell";
import FormSelect from "../../../../components/form-select";
import Popup from "../../../../components/popup";
import { Button } from "../../../../components/button";
import paths from "../../../../configs/constants/paths";
import { formatCurrency } from "../../../../utils/currency";
import { formatDate } from "../../../../utils";
import OrderStatusBadge from "../../order/components/order-status-badge";
import { PAYMENT_METHOD_LABEL } from "../../payment/utils";
import {
	usePrintShipment,
	useRedeliverShipment,
	useReturnShipment,
	useShipmentDetailQuery,
	useSyncShipment,
} from "../hooks";
import type { AdminShipment, GhnPrintSize } from "../types";
import {
	GHN_PRINT_SIZE_OPTIONS,
	canPrintShipment,
	canRedeliverShipment,
	canReturnShipment,
	getGhnStatusLabel,
} from "../utils";
import GhnStatusBadge from "./ghn-status-badge";
import { getApiErrorMessage } from "../../../../utils/api";

interface ShipmentDetailModalProps {
	shipment: AdminShipment;
	onClose: () => void;
}

const formatDateOrDash = (value: string | null) =>
	value ? formatDate(value) : "—";

const Row = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div className='flex justify-between gap-4 text-ink/80'>
		<span className='shrink-0'>{label}</span>
		<span className='text-right font-medium text-ink'>{children}</span>
	</div>
);

/**
 * Modal chi tiết 1 vận đơn GHN: thông tin người nhận lấy từ DB, còn trạng thái/lịch sử/ngày giao dự kiến/
 * tình trạng thu COD đọc trực tiếp từ GHN (useShipmentDetailQuery) nên luôn mới hơn danh sách. Cùng các
 * thao tác: đồng bộ trạng thái, in phiếu, giao lại, hoàn hàng.
 */
const ShipmentDetailModal = ({
	shipment,
	onClose,
}: ShipmentDetailModalProps) => {
	const navigate = useNavigate();
	const {
		data: detail,
		isLoading,
		isError,
		error,
		refetch,
		isFetching,
	} = useShipmentDetailQuery(shipment.id);
	const syncShipment = useSyncShipment();
	const redeliverShipment = useRedeliverShipment();
	const returnShipment = useReturnShipment();
	const printShipment = usePrintShipment();

	const [printSize, setPrintSize] = useState<GhnPrintSize>("a5");
	const [confirming, setConfirming] = useState<"redeliver" | "return" | null>(
		null,
	);

	// Ưu tiên trạng thái đọc trực tiếp từ GHN; chưa có thì dùng trạng thái đã lưu trong DB.
	const currentGhnStatus = detail?.status ?? shipment.ghnStatus ?? "";
	const isOutOfSync = Boolean(
		detail && shipment.ghnStatus && detail.status !== shipment.ghnStatus,
	);
	const address = shipment.shippingAddress;

	const handlePrint = () => {
		// Mở sẵn tab trống NGAY trong lúc click (lúc này trình duyệt còn coi là thao tác của người dùng) rồi mới
		// gán URL sau khi API trả về. Gọi window.open sau khi chờ API sẽ bị Safari/Brave chặn popup.
		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			toast.warn(
				"Trình duyệt đang chặn cửa sổ bật lên, vui lòng cho phép rồi thử lại.",
			);
			return;
		}
		printShipment.mutate(
			{ orderId: shipment.id, size: printSize },
			{
				onSuccess: (url) => {
					printWindow.location.href = url;
				},
				onError: () => printWindow.close(),
			},
		);
	};

	// Mở trang Order, tự điền ô tìm kiếm bằng mã đơn và tự mở modal chi tiết đơn đó — dùng chung cơ chế
	// với thông báo (xem `fromNotification` ở pages/admin/order/index.tsx).
	const handleViewOrder = () => {
		navigate(
			`${paths.admin.order}?search=${encodeURIComponent(shipment.orderNumber)}`,
			{ state: { fromNotification: true } },
		);
	};

	return (
		<ModalShell
			title='Chi tiết vận chuyển'
			onClose={onClose}
			maxWidthClassName='max-w-2xl'>
			<div className='max-h-[75vh] space-y-5 overflow-y-auto pr-1'>
				{/* Header */}
				<div className='flex flex-wrap items-start justify-between gap-2'>
					<div>
						<p className='font-semibold text-ink'>Đơn {shipment.orderNumber}</p>
						<p className='mt-1 text-xs text-muted'>
							Mã vận đơn GHN: {shipment.ghnOrderCode}
						</p>
					</div>
					<div className='flex flex-col items-end gap-1.5'>
						{currentGhnStatus && <GhnStatusBadge status={currentGhnStatus} />}
						<OrderStatusBadge status={shipment.orderStatus} />
					</div>
				</div>

				{isOutOfSync && (
					<p className='rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600'>
						Trạng thái trên GHN ({getGhnStatusLabel(detail!.status)}) khác với
						trạng thái đã lưu ({getGhnStatusLabel(shipment.ghnStatus!)}). Bấm
						"Đồng bộ trạng thái" để cập nhật.
					</p>
				)}

				{/* Người nhận */}
				<div className='space-y-1.5 rounded-xl bg-cream-soft p-4 text-sm'>
					<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>
						Người nhận
					</p>
					<p className='font-medium text-ink'>
						{address?.recipientName ?? "—"}
					</p>
					{address && (
						<>
							<p className='text-ink/80'>{address.phoneNumber}</p>
							<p className='text-ink/80'>
								{[
									address.addressLine,
									address.wardName,
									address.districtName,
									address.provinceName,
								].join(", ")}
							</p>
						</>
					)}
				</div>

				{/* Thanh toán */}
				<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
					<Row label='Phương thức thanh toán'>
						{shipment.payment
							? PAYMENT_METHOD_LABEL[shipment.payment.paymentMethod]
							: "—"}
					</Row>
					<Row label='Tổng tiền đơn hàng'>
						{formatCurrency(Number(shipment.totalAmount))}
					</Row>
					<Row label='Phí vận chuyển'>
						{formatCurrency(Number(shipment.shippingFee))}
					</Row>
				</div>

				{/* Thông tin từ GHN */}
				<div className='space-y-1.5 rounded-xl border border-border p-4 text-sm'>
					<p className='mb-1 text-xs font-semibold uppercase tracking-wider text-muted'>
						Thông tin từ Giao Hàng Nhanh
					</p>
					{isLoading ? (
						<p className='text-muted'>Đang tải thông tin từ GHN...</p>
					) : isError ? (
						<div className='space-y-2'>
							<p className='text-red-600'>
								{getApiErrorMessage(error, "Không tải được thông tin từ GHN.")}
							</p>
							<Button
								type='button'
								size='sm'
								variant='outline'
								onClick={() => refetch()}
								disabled={isFetching}>
								{isFetching ? "Đang tải..." : "Thử lại"}
							</Button>
						</div>
					) : (
						detail && (
							<>
								<Row label='Giao dự kiến'>
									{formatDateOrDash(detail.leadtime)}
								</Row>
								<Row label='Lấy hàng dự kiến'>
									{formatDateOrDash(detail.pickupTime)}
								</Row>
								<Row label='Giao thành công lúc'>
									{formatDateOrDash(detail.finishDate)}
								</Row>
								<Row label='Tiền thu hộ (COD)'>
									{detail.codAmount > 0
										? `${formatCurrency(detail.codAmount)} — ${detail.isCodCollected ? "đã thu" : "chưa thu"}`
										: "Không thu hộ"}
								</Row>
								<Row label='Khối lượng quy đổi'>{detail.convertedWeight} g</Row>
								{detail.note && <Row label='Ghi chú'>{detail.note}</Row>}
							</>
						)
					)}
				</div>

				{/* Lịch sử trạng thái, mới nhất ở trên cùng */}
				{detail && detail.log.length > 0 && (
					<div className='space-y-2 text-sm'>
						<p className='text-xs font-semibold uppercase tracking-wider text-muted'>
							Lịch sử vận chuyển
						</p>
						<ol className='space-y-2 border-l border-border pl-4'>
							{[...detail.log].reverse().map((entry, index) => (
								<li
									key={`${entry.status}-${entry.updatedDate}-${index}`}
									className='flex justify-between gap-4'>
									<span className='font-medium text-ink'>
										{getGhnStatusLabel(entry.status)}
									</span>
									<span className='shrink-0 text-xs text-muted'>
										{formatDate(entry.updatedDate)}
									</span>
								</li>
							))}
						</ol>
					</div>
				)}

				{/* Thao tác */}
				<div className='flex flex-wrap items-end gap-2 border-t border-border pt-4'>
					<Button
						type='button'
						size='sm'
						variant='outline'
						disabled={syncShipment.isPending}
						onClick={() => syncShipment.mutate(shipment.id)}>
						{syncShipment.isPending ? "Đang đồng bộ..." : "Đồng bộ trạng thái"}
					</Button>
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={handleViewOrder}>
						Xem đơn hàng
					</Button>

					<div className='ml-auto flex flex-wrap items-end gap-2'>
						<FormSelect
							size='sm'
							value={printSize}
							onChange={(e) => setPrintSize(e.target.value as GhnPrintSize)}
							options={GHN_PRINT_SIZE_OPTIONS}
						/>
						<Button
							type='button'
							size='sm'
							variant='outline'
							disabled={
								!canPrintShipment(currentGhnStatus) || printShipment.isPending
							}
							onClick={handlePrint}>
							{printShipment.isPending ? "Đang tạo..." : "In vận đơn"}
						</Button>
						{canRedeliverShipment(currentGhnStatus) && (
							<Button
								type='button'
								size='sm'
								onClick={() => setConfirming("redeliver")}>
								Giao lại
							</Button>
						)}
						{canReturnShipment(currentGhnStatus) && (
							<Button
								type='button'
								size='sm'
								variant='dark'
								onClick={() => setConfirming("return")}>
								Hoàn hàng
							</Button>
						)}
					</div>
				</div>
			</div>

			{confirming === "redeliver" && (
				<Popup
					title='Giao lại đơn hàng'
					description={`Yêu cầu Giao Hàng Nhanh giao lại đơn ${shipment.orderNumber} cho người nhận?`}
					confirmLabel='Giao lại'
					isConfirming={redeliverShipment.isPending}
					onConfirm={() =>
						redeliverShipment.mutate(shipment.id, {
							onSuccess: () => setConfirming(null),
						})
					}
					onClose={() => setConfirming(null)}
				/>
			)}

			{confirming === "return" && (
				<Popup
					title='Hoàn hàng về shop'
					description={`Yêu cầu Giao Hàng Nhanh hoàn đơn ${shipment.orderNumber} về shop? Khi GHN báo hoàn hàng, đơn trong hệ thống có thể tự chuyển sang "Đã hủy" và hoàn lại tồn kho.`}
					variant='danger'
					confirmLabel='Hoàn hàng'
					isConfirming={returnShipment.isPending}
					onConfirm={() =>
						returnShipment.mutate(shipment.id, {
							onSuccess: () => setConfirming(null),
						})
					}
					onClose={() => setConfirming(null)}
				/>
			)}
		</ModalShell>
	);
};

export default ShipmentDetailModal;
