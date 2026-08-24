import type { OrderStatus } from "../../generated/prisma/index.js";

export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = Object.freeze({
	pending: "đang chờ xử lý",
	processing: "đang được chuẩn bị",
	shipped: "đang được giao",
	delivered: "đã giao thành công",
	cancelled: "đã bị hủy",
} as const);
