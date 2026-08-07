import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "../../generated/prisma/index.js";

const numericIdString = z.string().regex(/^\d+$/, { message: "Must be a positive integer." });
const paymentStatusEnum = z.enum([PaymentStatus.pending, PaymentStatus.completed, PaymentStatus.failed, PaymentStatus.refunded]);
const paymentMethodEnum = z.enum([PaymentMethod.cod, PaymentMethod.vnpay, PaymentMethod.momo, PaymentMethod.stripe, PaymentMethod.paypal]);

// ==========================================
// Self-service: xem & xác nhận thanh toán đơn của chính mình
// ==========================================
export const OwnPaymentParamSchema = z.object({
	params: z.object({ orderId: numericIdString }),
});

export const ConfirmOwnPaymentSchema = z.object({
	params: z.object({ orderId: numericIdString }),
	body: z.object({
		transactionId: z.string().min(1).max(255).optional(),
	}),
});

// ==========================================
// Admin
// ==========================================
export const ListPaymentsAdminQuerySchema = z.object({
	query: z.object({
		page: z.string().regex(/^\d+$/).optional(),
		limit: z.string().regex(/^\d+$/).optional(),
		status: paymentStatusEnum.optional(),
		method: paymentMethodEnum.optional(),
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

export const PaymentIdParamSchema = z.object({
	params: z.object({ id: numericIdString }),
});

export const UpdatePaymentStatusSchema = z.object({
	params: z.object({ id: numericIdString }),
	body: z.object({
		status: paymentStatusEnum,
		transactionId: z.string().min(1).max(255).optional(),
	}),
});
