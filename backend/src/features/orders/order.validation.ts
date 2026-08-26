import { z } from "zod";
import { OrderStatus, PaymentMethod } from "../../generated/prisma/index.js";
import { numericIdString } from "../../shared/validation.js";

const orderStatusEnum = z.enum([OrderStatus.pending, OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered, OrderStatus.cancelled]);
const paymentMethodEnum = z.enum([PaymentMethod.cod, PaymentMethod.vnpay, PaymentMethod.zalopay, PaymentMethod.momo, PaymentMethod.stripe, PaymentMethod.paypal]);

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

// ==========================================
// Self-service: mua ngay (bấm "Mua ngay" ở trang chi tiết sản phẩm -> thẳng qua trang thanh
// toán chỉ với đúng 1 SKU này, không đụng tới giỏ hàng hiện có của khách)
// ==========================================
export const BuyNowSchema = z.object({
	body: z.object({
		productSkuId: z.number().int().positive({ message: "productSkuId không hợp lệ." }),
		quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0." }),
		shippingAddressId: z.number().int().positive({ message: "shippingAddressId không hợp lệ." }),
		paymentMethod: paymentMethodEnum,
		couponCode: z.string().min(1).max(50).optional(),
		// FE tự sinh (vd: crypto.randomUUID()) 1 LẦN DUY NHẤT khi khách bấm "Đặt hàng" ở trang mua
		// ngay, giữ nguyên giá trị này cho tới khi request kết thúc (kể cả khi client tự động retry
		// do mất mạng). BE dùng giá trị này làm gate chống double-submit — xem processCheckout()
		// trong order.service.ts.
		idempotencyKey: z.string().min(8, { message: "idempotencyKey không hợp lệ." }).max(64),
	}),
});

export const PreviewBuyNowShippingFeeSchema = z.object({
	body: z.object({
		productSkuId: z.number().int().positive({ message: "productSkuId không hợp lệ." }),
		quantity: z.number().int().positive({ message: "Số lượng phải lớn hơn 0." }),
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

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>["body"];
export type BuyNowInput = z.infer<typeof BuyNowSchema>["body"];
export type ListOwnOrdersParams = z.infer<typeof ListOwnOrdersQuerySchema>["query"];
export type ListOrdersAdminParams = z.infer<typeof ListOrdersAdminQuerySchema>["query"];
