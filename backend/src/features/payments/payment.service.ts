import prisma from "../../config/prisma.js";
import type { PaymentStatus } from "../../generated/prisma/index.js";
import { parsePagination } from "../../utils/index.js";
import { isValidPaymentStatusTransition } from "./payment.utils.js";

interface ListPaymentsAdminParams {
	page?: string;
	limit?: string;
	status?: string;
	method?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

const paymentDetailInclude = {
	order: {
		select: {
			id: true,
			orderNumber: true,
			orderStatus: true,
			totalAmount: true,
			userId: true,
			couponId: true,
			user: { select: { id: true, name: true, email: true } },
		},
	},
};

class PaymentService {
	// ==========================================
	// Self-service: xem & xác nhận thanh toán đơn của chính mình
	// ==========================================
	async getOwnPayment(userId: number, orderId: number) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		if (payment.order.userId !== userId) {
			throw new Error("NotFound: Không tìm thấy thông tin thanh toán cho đơn hàng này.");
		}
		return payment;
	}

	/**
	 * Khách xác nhận đã hoàn tất thanh toán qua cổng thanh toán online (vnpay/momo/stripe/paypal).
	 * COD không dùng endpoint này vì tiền được thu trực tiếp khi giao hàng, không qua cổng thanh toán.
	 */
	async confirmOwnPayment(userId: number, orderId: number, transactionId?: string) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		if (payment.order.userId !== userId) {
			throw new Error("NotFound: Không tìm thấy thông tin thanh toán cho đơn hàng này.");
		}
		if (payment.paymentMethod === "cod") {
			throw new Error("BadRequest: Đơn hàng thanh toán khi nhận hàng (COD) không cần xác nhận thanh toán online.");
		}

		return this.transitionStatus(payment, "completed", transactionId);
	}

	// ==========================================
	// Admin
	// ==========================================
	async listPaymentsAdmin(params: ListPaymentsAdminParams) {
		const where: Record<string, unknown> = {};

		if (params.status) where.paymentStatus = params.status;
		if (params.method) where.paymentMethod = params.method;
		if (params.search) {
			where.order = {
				OR: [
					{ orderNumber: { contains: params.search } },
					{ user: { email: { contains: params.search } } },
					{ user: { name: { contains: params.search } } },
				],
			};
		}
		if (params.dateFrom || params.dateTo) {
			where.createdAt = {
				...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
				...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
			};
		}

		const { page, limit, skip } = parsePagination(params);
		const [payments, total] = await Promise.all([
			prisma.payment.findMany({
				where,
				include: paymentDetailInclude,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.payment.count({ where }),
		]);

		return {
			data: payments,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getPaymentById(id: number) {
		return this.getPaymentOrThrow(id, paymentDetailInclude);
	}

	/** Staff cập nhật trạng thái giao dịch thanh toán thủ công (vd: xác nhận đã nhận tiền, đánh dấu thất bại, hoàn tiền). */
	async updatePaymentStatus(id: number, status: PaymentStatus, transactionId?: string) {
		const payment = await prisma.payment.findUnique({ where: { id }, include: paymentDetailInclude });
		if (!payment) {
			throw new Error("NotFound: Không tìm thấy giao dịch thanh toán.");
		}
		return this.transitionStatus(payment, status, transactionId);
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async transitionStatus(
		payment: { id: number; paymentStatus: string; order: { id: number; couponId: number | null; orderStatus: string } },
		nextStatus: PaymentStatus,
		transactionId?: string,
	) {
		const currentStatus = payment.paymentStatus as PaymentStatus;

		if (!isValidPaymentStatusTransition(currentStatus, nextStatus)) {
			throw new Error(`BadRequest: Không thể chuyển trạng thái thanh toán từ "${currentStatus}" sang "${nextStatus}".`);
		}

		return prisma.$transaction(async (tx) => {
			const updated = await tx.payment.update({
				where: { id: payment.id },
				data: {
					paymentStatus: nextStatus,
					...(transactionId ? { transactionId } : {}),
					...(nextStatus === "completed" ? { paidAt: new Date() } : {}),
				},
				include: paymentDetailInclude,
			});

			if (nextStatus === "completed") {
				// Thanh toán thành công -> tự động đẩy đơn từ "pending" sang "processing" để xưởng bắt đầu xử lý.
				// Dùng updateMany có điều kiện thay vì update để không ghi đè trạng thái nếu đơn đã được xử lý thủ công trước đó.
				await tx.order.updateMany({
					where: { id: payment.order.id, orderStatus: "pending" },
					data: { orderStatus: "processing" },
				});
			}

			if (
				nextStatus === "refunded" &&
				payment.order.orderStatus !== "cancelled" &&
				payment.order.orderStatus !== "delivered"
			) {
				// Hoàn tiền -> hoàn tồn kho + hoàn lượt dùng coupon + hủy đơn, tương tự luồng hủy đơn thông thường
				const items = await tx.orderItem.findMany({ where: { orderId: payment.order.id } });
				for (const item of items) {
					if (item.productSkuId) {
						await tx.productSku.update({
							where: { id: item.productSkuId },
							data: { stockQuantity: { increment: item.quantity } },
						});
					}
				}
				if (payment.order.couponId) {
					await tx.coupon.update({ where: { id: payment.order.couponId }, data: { usedCount: { decrement: 1 } } });
				}
				await tx.order.update({ where: { id: payment.order.id }, data: { orderStatus: "cancelled" } });
			}

			return updated;
		});
	}

	private async getPaymentByOrderOrThrow(orderId: number) {
		const payment = await prisma.payment.findUnique({ where: { orderId }, include: paymentDetailInclude });
		if (!payment) {
			throw new Error("NotFound: Không tìm thấy thông tin thanh toán cho đơn hàng này.");
		}
		return payment;
	}

	private async getPaymentOrThrow(id: number, include?: Record<string, unknown>) {
		const payment = await prisma.payment.findUnique({ where: { id }, ...(include ? { include } : {}) });
		if (!payment) {
			throw new Error("NotFound: Không tìm thấy giao dịch thanh toán.");
		}
		return payment;
	}
}

export default new PaymentService();
