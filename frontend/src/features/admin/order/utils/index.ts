import { ORDER_STATUS, type OrderStatus } from "../../../../shared/constants/order";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	[ORDER_STATUS.pending]: "Chờ xử lý",
	[ORDER_STATUS.processing]: "Đang xử lý",
	[ORDER_STATUS.shipped]: "Đang giao",
	[ORDER_STATUS.delivered]: "Đã giao",
	[ORDER_STATUS.cancelled]: "Đã hủy",
};

export const ORDER_STATUS_BADGE_CLASSNAME: Record<OrderStatus, string> = {
	[ORDER_STATUS.pending]: "bg-amber-50 text-amber-600",
	[ORDER_STATUS.processing]: "bg-blue-50 text-blue-600",
	[ORDER_STATUS.shipped]: "bg-violet-50 text-violet-600",
	[ORDER_STATUS.delivered]: "bg-primary-light text-primary-dark",
	[ORDER_STATUS.cancelled]: "bg-red-50 text-red-600",
};

/**
 * Mirror của ALLOWED_TRANSITIONS ở backend (order.utils.ts:isValidOrderStatusTransition)
 * — chỉ dùng để giới hạn option hiển thị trong dropdown đổi trạng thái cho gọn UX (ẩn
 * bớt bước chuyển vô nghĩa, vd. không cho chọn "pending" khi đơn đang "shipped").
 * Backend vẫn là nơi validate thật sự, FE không tự ý tin tưởng 100% để tránh lệch logic
 * nếu 2 bên không đồng bộ. "delivered"/"cancelled" là trạng thái cuối, không có bước chuyển tiếp.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	[ORDER_STATUS.pending]: [ORDER_STATUS.processing, ORDER_STATUS.cancelled],
	[ORDER_STATUS.processing]: [ORDER_STATUS.shipped, ORDER_STATUS.cancelled],
	[ORDER_STATUS.shipped]: [ORDER_STATUS.delivered, ORDER_STATUS.cancelled],
	[ORDER_STATUS.delivered]: [],
	[ORDER_STATUS.cancelled]: [],
};

export const getNextOrderStatusOptions = (current: OrderStatus): OrderStatus[] => {
	return [current, ...ALLOWED_TRANSITIONS[current]];
};

/** true nếu đơn đang ở trạng thái cuối (không thể đổi trạng thái được nữa). */
export const isTerminalOrderStatus = (status: OrderStatus): boolean => ALLOWED_TRANSITIONS[status].length === 0;
