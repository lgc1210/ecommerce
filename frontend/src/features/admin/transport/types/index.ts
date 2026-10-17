import type { OrderStatus } from "../../../../shared/constants/order";
import type {
	PaymentMethod,
	PaymentStatus,
} from "../../../../shared/constants/payment";
import type { Pagination } from "../../../../types";

/**
 * 1 đơn hàng đã có vận đơn GHN (backend/transport.service.ts -> shipmentListInclude). `ghnStatus` là
 * trạng thái vận chuyển THÔ do GHN báo về qua webhook (ready_to_pick, delivering, ...), khác với
 * `orderStatus` là trạng thái xử lý nội bộ của hệ thống.
 */
export interface AdminShipment {
	id: number;
	orderNumber: string;
	orderStatus: OrderStatus;
	ghnOrderCode: string | null;
	ghnStatus: string | null;
	totalAmount: string;
	shippingFee: string;
	createdAt: string | null;
	user: { id: number; name: string; email: string } | null;
	shippingAddress: {
		recipientName: string;
		phoneNumber: string;
		addressLine: string;
		wardName: string;
		districtName: string;
		provinceName: string;
	} | null;
	payment: {
		paymentMethod: PaymentMethod;
		paymentStatus: PaymentStatus;
	} | null;
}

export interface ListShipmentsParams {
	page?: number;
	limit?: number;
	ghnStatus?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface ListShipmentsResult {
	data: AdminShipment[];
	pagination: Pagination;
}

export interface GhnShipmentLog {
	status: string;
	updatedDate: string;
}

/** Chi tiết vận đơn đọc trực tiếp từ GHN (backend/ghn.service.ts -> GhnShipmentDetail). */
export interface GhnShipmentDetail {
	status: string;
	orderDate: string | null;
	pickupTime: string | null;
	/** Thời gian giao dự kiến */
	leadtime: string | null;
	finishDate: string | null;
	codAmount: number;
	isCodCollected: boolean;
	codCollectDate: string | null;
	codTransferDate: string | null;
	weight: number;
	convertedWeight: number;
	requiredNote: string | null;
	note: string | null;
	/** Lịch sử trạng thái, cũ -> mới */
	log: GhnShipmentLog[];
}

export type GhnPrintSize = "a5" | "80x80" | "50x72";
