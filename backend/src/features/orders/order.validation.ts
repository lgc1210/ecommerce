import { z } from "zod";
import { ORDER_STATUS, PAYMENT_METHOD } from "./order.constant.js";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const orderStatusEnum = z.enum([
	ORDER_STATUS.pending,
	ORDER_STATUS.processing,
	ORDER_STATUS.shipped,
	ORDER_STATUS.delivered,
	ORDER_STATUS.cancelled,
]);
const paymentMethodEnum = z.enum([
	PAYMENT_METHOD.cod,
	PAYMENT_METHOD.vnpay,
	PAYMENT_METHOD.momo,
	PAYMENT_METHOD.stripe,
	PAYMENT_METHOD.paypal,
]);

// ==========================================
// Self-service: checkout
// ==========================================
export const CreateOrderSchema = z.object({
	body: z.object({
		shippingAddressId: z.number().int().positive({ message: "shippingAddressId không hợp lệ." }),
		paymentMethod: paymentMethodEnum,
		couponCode: z.string().min(1).max(50).optional(),
	}),
});

export const PreviewShippingFeeSchema = z.object({
	body: z.object({
		shippingAddressId: z.number().int().positive({ message: "shippingAddressId không hợp lệ." }),
	}),
});

export const ListOwnOrdersQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: orderStatusEnum.optional(),
	}),
});

export const OrderIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

// ==========================================
// Admin
// ==========================================
export const ListOrdersAdminQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: orderStatusEnum.optional(),
		userId: z.string().regex(/^\d+$/).optional(),
		search: z.string().max(100).optional(),
		dateFrom: z
			.string()
			.refine((value) => !Number.isNaN(Date.parse(value)), {
				message: "Định dạng ngày không hợp lệ (cần dạng ISO 8601).",
			})
			.optional(),
		dateTo: z
			.string()
			.refine((value) => !Number.isNaN(Date.parse(value)), {
				message: "Định dạng ngày không hợp lệ (cần dạng ISO 8601).",
			})
			.optional(),
	}),
});

export const UpdateOrderStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({
		status: orderStatusEnum,
	}),
});

// ==========================================
// Webhook: GHN gọi ngược về khi trạng thái vận chuyển thay đổi
// ==========================================
/**
 * Payload GHN gửi qua callback URL (cấu hình ở trang quản lý shop GHN, không phải qua API) mỗi
 * khi trạng thái đơn thay đổi. Chỉ validate 2 field thực sự dùng tới (OrderCode, Status) — payload
 * thật của GHN có rất nhiều field khác (Fee, Weight, ...) nhưng không cần thiết cho việc đồng bộ.
 */
export const GhnWebhookSchema = z.object({
	body: z.object({
		OrderCode: z.string().min(1, { message: "OrderCode không được để trống." }),
		Status: z.string().min(1, { message: "Status không được để trống." }),
	}),
});
