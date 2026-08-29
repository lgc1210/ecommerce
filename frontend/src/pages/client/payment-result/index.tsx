import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../components/breadcrumb";
import Button from "../../../components/button";
import { CheckIcon, ClockIcon, XIcon } from "../../../components/icons";
import paths from "../../../configs/constants/paths";
import { useOwnPaymentQuery } from "../../../features/client/payment/hooks";
import { formatCurrency } from "../../../utils/currency";
import { ONLINE_GATEWAY_METHODS, PAYMENT_STATUS } from "../../../shared/constants/payment";
import { PAYMENT_METHOD_LABEL } from "../../../features/admin/payment/utils";

/**
 * Suy ra Order.id từ query string trình duyệt được redirect về:
 * - VNPay: backend (GET /payments/vnpay/return) đã verify chữ ký rồi mới redirect về đây kèm sẵn
 *   `orderId` -> dùng trực tiếp.
 * - ZaloPay: redirect thẳng từ ZaloPay (không qua backend, không có chữ ký đáng tin cậy) -> chỉ có
 *   `apptransid` dạng "<yyMMdd>_<orderId>_<timestamp>" (xem backend zalopay.gateway.ts), phải tách
 *   thủ công. Dù suy ra được orderId từ đây, trạng thái hiển thị VẪN đọc lại từ API (useOwnPaymentQuery)
 *   chứ không tin trực tiếp query param "status" của ZaloPay.
 */
function resolveOrderIdFromQuery(searchParams: URLSearchParams): number | null {
	const orderIdParam = searchParams.get("orderId");
	if (orderIdParam) {
		const parsed = Number(orderIdParam);
		return Number.isFinite(parsed) ? parsed : null;
	}

	const appTransId = searchParams.get("apptransid");
	if (appTransId) {
		const parsed = Number(appTransId.split("_")[1]);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

const PaymentResultPage = () => {
	const [searchParams] = useSearchParams();
	const orderId = useMemo(() => resolveOrderIdFromQuery(searchParams), [searchParams]);

	const { data: payment, isLoading, isError } = useOwnPaymentQuery(orderId);

	const renderContent = () => {
		if (orderId === null) {
			return <ResultCard tone='failed' title='Không xác định được đơn hàng' description='Đường dẫn quay về từ cổng thanh toán không hợp lệ hoặc đã hết hạn.' />;
		}
		if (isLoading && !payment) {
			return <ResultCard tone='pending' title='Đang tải thông tin thanh toán...' description='Vui lòng đợi trong giây lát.' />;
		}
		if (isError || !payment) {
			return <ResultCard tone='failed' title='Không tải được thông tin thanh toán' description='Vui lòng kiểm tra lại trong mục "Đơn hàng của tôi".' />;
		}
		if (payment.paymentStatus === PAYMENT_STATUS.pending) {
			// COD không đi qua cổng thanh toán online -> đơn đã đặt thành công ngay, "pending" ở đây
			// nghĩa là chờ thu tiền mặt lúc giao hàng chứ không phải chờ cổng thanh toán xác nhận như
			// VNPay/ZaloPay, nên cần thông điệp riêng để tránh gây hiểu nhầm là thanh toán chưa xong.
			if (!ONLINE_GATEWAY_METHODS.includes(payment.paymentMethod)) {
				return <ResultCard tone='success' title='Đặt hàng thành công' description='Đơn hàng của bạn đã được ghi nhận và đang xử lý. Vui lòng thanh toán khi nhận hàng (COD).' payment={payment} />;
			}
			return <ResultCard tone='pending' title='Đang xác nhận thanh toán...' description='Hệ thống đang chờ xác nhận từ cổng thanh toán, trang sẽ tự cập nhật ngay khi có kết quả.' payment={payment} />;
		}
		if (payment.paymentStatus === PAYMENT_STATUS.completed) {
			return <ResultCard tone='success' title='Thanh toán thành công' description='Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đang được xử lý.' payment={payment} />;
		}
		if (payment.paymentStatus === PAYMENT_STATUS.refunded) {
			return <ResultCard tone='pending' title='Đơn hàng đã được hoàn tiền' description='Giao dịch này đã được hoàn tiền, vui lòng kiểm tra chi tiết trong "Đơn hàng của tôi".' payment={payment} />;
		}
		return (
			<ResultCard tone='failed' title='Thanh toán thất bại' description='Giao dịch không thành công hoặc đã bị hủy. Bạn có thể thử thanh toán lại từ trang chi tiết đơn hàng.' payment={payment} />
		);
	};

	return (
		<>
			<BreadCrumb title='Kết quả thanh toán' description='Xem kết quả giao dịch thanh toán online' />
			<div className='mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8'>{renderContent()}</div>
		</>
	);
};

interface ResultCardProps {
	tone: "success" | "failed" | "pending";
	title: string;
	description: string;
	payment?: {
		order: { orderNumber: string; totalAmount: string };
		paymentMethod: keyof typeof PAYMENT_METHOD_LABEL;
	};
}

const TONE_STYLES: Record<ResultCardProps["tone"], { icon: typeof CheckIcon; wrapClass: string; iconClass: string }> = {
	success: { icon: CheckIcon, wrapClass: "bg-primary-light", iconClass: "text-primary-dark" },
	failed: { icon: XIcon, wrapClass: "bg-red-50", iconClass: "text-red-600" },
	pending: { icon: ClockIcon, wrapClass: "bg-amber-50", iconClass: "text-amber-600" },
};

const ResultCard = ({ tone, title, description, payment }: ResultCardProps) => {
	const { icon: Icon, wrapClass, iconClass } = TONE_STYLES[tone];

	return (
		<div className='rounded-3xl border border-border bg-white p-8 text-center shadow-sm'>
			<div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${wrapClass}`}>
				<Icon className={`h-8 w-8 ${iconClass}`} />
			</div>
			<h1 className='mt-5 text-xl font-bold text-ink'>{title}</h1>
			<p className='mt-2 text-sm text-muted'>{description}</p>

			{payment && (
				<div className='mt-6 space-y-1.5 rounded-2xl bg-surface p-4 text-left text-sm'>
					<div className='flex justify-between'>
						<span className='text-muted'>Mã đơn hàng</span>
						<span className='font-semibold text-ink'>{payment.order.orderNumber}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-muted'>Phương thức</span>
						<span className='text-ink'>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</span>
					</div>
					<div className='flex justify-between'>
						<span className='text-muted'>Số tiền</span>
						<span className='font-semibold text-ink'>{formatCurrency(Number(payment.order.totalAmount))}</span>
					</div>
				</div>
			)}

			<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
				<Link to={paths.client.account} state={{ tab: "orders" }} className='w-full!'>
					<Button variant='outline' className='w-full!'>
						Xem đơn hàng của tôi
					</Button>
				</Link>
				<Link to={paths.client.shop} className='w-full!'>
					<Button className='w-full!'>Tiếp tục mua sắm</Button>
				</Link>
			</div>
		</div>
	);
};

export default PaymentResultPage;
