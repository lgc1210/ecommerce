import prisma from "../../config/prisma.js";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../generated/prisma/index.js";
import { parsePagination } from "../../utils/index.js";
import { isValidPaymentStatusTransition } from "./payment.utils.js";
import orderService from "../orders/order.service.js";
import notificationService from "../notifications/notification.service.js";
import type { ListPaymentsAdminParams } from "./payment.validation.js";

const paymentDetailInclude = {
	order: {
		select: {
			id: true,
			orderNumber: true,
			orderStatus: true,
			totalAmount: true,
			userId: true,
			couponId: true,
			ghnOrderCode: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
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
		if (payment.paymentMethod === PaymentMethod.cod) {
			throw new Error("BadRequest: Đơn hàng thanh toán khi nhận hàng (COD) không cần xác nhận thanh toán online.");
		}
		if (payment.order.orderStatus === OrderStatus.cancelled) {
			throw new Error("BadRequest: Đơn hàng này đã bị hủy, không thể xác nhận thanh toán.");
		}
		return this.transitionStatus(payment, PaymentStatus.completed, transactionId);
	}

	/**
	 * Khách đổi phương thức thanh toán cho đơn của chính mình — CHỈ khi đơn còn "pending" (chưa được
	 * duyệt/xử lý) VÀ (phương thức hiện tại là COD, HOẶC là online nhưng chưa thanh toán "completed").
	 * - COD -> online: đơn COD đã có sẵn vận đơn GHN thu hộ tiền mặt (tạo ngay lúc checkout()) -> phải
	 *   hủy vận đơn đó trước, nếu không GHN vẫn thu COD dù khách trả tiền qua cổng online. Vận đơn thật
	 *   sự chỉ được tạo lại sau khi thanh toán online "completed" (xem createShipmentAfterPayment()).
	 * - online -> COD: đơn online chưa thanh toán thì CHƯA có vận đơn nào (xem checkout()) -> tạo vận
	 *   đơn COD ngay, giống hệt nhánh COD lúc checkout(). Nếu GHN lỗi ở bước này, rollback lại đúng
	 *   phương thức/trạng thái thanh toán cũ — không để đơn ở trạng thái "COD nhưng chưa có vận đơn"
	 *   mập mờ, khách có thể thử đổi lại ngay.
	 * - online -> online khác (vd vnpay -> zalopay): không đụng gì tới GHN, chỉ đổi paymentMethod.
	 * "failed" được reset về "pending" khi đổi phương thức — đổi phương thức nghĩa là 1 lượt thử
	 * thanh toán mới, khách cần tạo được giao dịch mới qua cổng vừa chọn (payment.utils.ts cho phép
	 * failed -> pending).
	 */
	async changeOwnPaymentMethod(userId: number, orderId: number, newMethod: PaymentMethod) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		if (payment.order.userId !== userId) {
			throw new Error("NotFound: Không tìm thấy thông tin thanh toán cho đơn hàng này.");
		}
		if (payment.order.orderStatus !== OrderStatus.pending) {
			throw new Error('BadRequest: Chỉ có thể đổi phương thức thanh toán khi đơn hàng đang ở trạng thái "chờ xử lý".');
		}
		const isCurrentlyCod = payment.paymentMethod === PaymentMethod.cod;
		if (!isCurrentlyCod && payment.paymentStatus === PaymentStatus.completed) {
			throw new Error("BadRequest: Đơn hàng đã thanh toán thành công, không thể đổi phương thức thanh toán.");
		}
		if (payment.paymentStatus === PaymentStatus.refunded) {
			throw new Error("BadRequest: Đơn hàng đã được hoàn tiền, không thể đổi phương thức thanh toán.");
		}
		if (payment.paymentMethod === newMethod) {
			return payment; // no-op, khỏi làm gì thêm
		}

		const willBeCod = newMethod === PaymentMethod.cod;

		// COD -> online: hủy vận đơn COD cũ TRƯỚC. Nếu GHN từ chối hủy (đã lấy hàng) thì dừng lại ở
		// đây luôn (ném lỗi), CHƯA đổi gì trong DB cả.
		if (isCurrentlyCod && !willBeCod && payment.order.ghnOrderCode) {
			await orderService.cancelCodShipmentForPaymentMethodChange(payment.order.id, payment.order.ghnOrderCode);
		}

		const updated = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				paymentMethod: newMethod,
				...(payment.paymentStatus === PaymentStatus.failed ? { paymentStatus: PaymentStatus.pending } : {}),
			},
			include: paymentDetailInclude,
		});

		// online -> COD: đơn online chưa thanh toán thì chưa có vận đơn nào -> tạo vận đơn COD ngay.
		if (!isCurrentlyCod && willBeCod) {
			try {
				await orderService.createCodShipmentForOrder(payment.order.id);
			} catch (error) {
				// Tạo vận đơn COD thất bại -> rollback lại đúng phương thức/trạng thái thanh toán cũ,
				// không để đơn "kẹt" ở COD mà không có vận đơn nào.
				await prisma.payment.update({
					where: { id: payment.id },
					data: { paymentMethod: payment.paymentMethod, paymentStatus: payment.paymentStatus },
				});
				throw error;
			}
		}

		return updated;
	}

	// ==========================================
	// Cổng thanh toán online (VNPay/ZaloPay/...) — xem payment-gateway.service.ts
	// ==========================================
	/** Kiểm tra đơn thuộc về đúng user, phải là phương thức online (không phải COD) và chưa ở trạng thái cuối, trước khi tạo URL thanh toán mới. */
	async getGatewayPaymentContext(userId: number, orderId: number) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		if (payment.order.userId !== userId) {
			throw new Error("NotFound: Không tìm thấy thông tin thanh toán cho đơn hàng này.");
		}
		if (payment.paymentMethod === PaymentMethod.cod) {
			throw new Error("BadRequest: Đơn hàng thanh toán khi nhận hàng (COD) không thể tạo giao dịch qua cổng thanh toán online.");
		}
		if (payment.paymentStatus === PaymentStatus.completed || payment.paymentStatus === PaymentStatus.refunded) {
			throw new Error(`BadRequest: Đơn hàng này đã ở trạng thái thanh toán "${payment.paymentStatus}", không thể tạo giao dịch mới.`);
		}
		// Đơn hủy thì paymentStatus bị chuyển về "failed" (xem
		// order.service.ts -> transitionOrderStatus), mà "failed" KHÔNG nằm trong check phía trên
		// (failed -> pending vẫn hợp lệ để retry thanh toán bình thường) nên trước đây lọt qua được,
		// khách vẫn tạo được URL thanh toán mới cho 1 đơn đã hủy (tồn kho đã hoàn, vận đơn GHN đã hủy).
		if (payment.order.orderStatus === OrderStatus.cancelled) {
			throw new Error("BadRequest: Đơn hàng này đã bị hủy, không thể thanh toán. Vui lòng đặt lại đơn hàng mới.");
		}
		return payment;
	}

	/** Chuyển payment sang "completed" — CHỈ được gọi từ IPN/callback đã xác thực chữ ký hợp lệ (xem payment-gateway.service.ts). */
	async completeGatewayPayment(orderId: number, transactionId: string | null) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		return this.transitionStatus(payment, PaymentStatus.completed, transactionId ?? undefined);
	}

	/** Chuyển payment sang "failed" — CHỈ được gọi từ IPN/callback đã xác thực chữ ký hợp lệ (xem payment-gateway.service.ts). */
	async failGatewayPayment(orderId: number, transactionId: string | null) {
		const payment = await this.getPaymentByOrderOrThrow(orderId);
		// Nếu payment đã ở trạng thái cuối (vd 1 IPN "completed" khác đã xử lý trước đó do gọi
		// trùng/race) thì bỏ qua thay vì ném lỗi — giữ idempotent cho các lượt gateway gọi lại retry.
		if (payment.paymentStatus === PaymentStatus.completed || payment.paymentStatus === PaymentStatus.refunded) {
			return payment;
		}
		return this.transitionStatus(payment, PaymentStatus.failed, transactionId ?? undefined);
	}

	/** Đọc nhanh trạng thái thanh toán hiện tại theo orderId — dùng để hiển thị UI ở trang return (xem payment-gateway.service.ts), trả null nếu không tìm thấy thay vì ném lỗi. */
	async getPaymentStatusByOrderId(orderId: number): Promise<PaymentStatus | null> {
		const payment = await prisma.payment.findUnique({ where: { orderId }, select: { paymentStatus: true } });
		return payment?.paymentStatus ?? null;
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
				OR: [{ orderNumber: { contains: params.search } }, { user: { email: { contains: params.search } } }, { user: { name: { contains: params.search } } }],
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
		payment: {
			id: number;
			paymentStatus: string;
			order: { id: number; orderNumber: string; userId: number | null; couponId: number | null; orderStatus: string };
		},
		nextStatus: PaymentStatus,
		transactionId?: string,
	) {
		const currentStatus = payment.paymentStatus as PaymentStatus;

		if (!isValidPaymentStatusTransition(currentStatus, nextStatus)) {
			throw new Error(`BadRequest: Không thể chuyển trạng thái thanh toán từ "${currentStatus}" sang "${nextStatus}".`);
		}

		// MỚI — phòng thủ thêm 1 lớp nữa (ngoài check ở getGatewayPaymentContext/confirmOwnPayment):
		// đơn đã bị hủy thì KHÔNG được phép hoàn tất thanh toán trong bất kỳ trường hợp nào, kể cả khi
		// 1 IPN hợp lệ tới muộn (race condition: khách hủy đơn đúng lúc IPN đang bay tới) hoặc staff
		// cập nhật thủ công nhầm. Không áp dụng cho "failed"/"refunded" vì đơn hủy vẫn hợp lệ chuyển
		// các trạng thái đó (dọn payment "pending" mồ côi, hoặc hoàn tiền 1 đơn lỡ đã completed trước hủy).
		if (nextStatus === PaymentStatus.completed && payment.order.orderStatus === OrderStatus.cancelled) {
			throw new Error("BadRequest: Đơn hàng này đã bị hủy, không thể hoàn tất thanh toán.");
		}

		const result = await prisma.$transaction(async (tx) => {
			const updated = await tx.payment.update({
				where: { id: payment.id },
				data: {
					paymentStatus: nextStatus,
					...(transactionId ? { transactionId } : {}),
					...(nextStatus === PaymentStatus.completed ? { paidAt: new Date() } : {}),
				},
				include: paymentDetailInclude,
			});

			if (nextStatus === PaymentStatus.completed) {
				// Thanh toán thành công -> tự động đẩy đơn từ "pending" sang "processing" để xưởng bắt đầu xử lý.
				// Dùng updateMany có điều kiện thay vì update để không ghi đè trạng thái nếu đơn đã được xử lý thủ công trước đó.
				await tx.order.updateMany({
					where: { id: payment.order.id, orderStatus: OrderStatus.pending },
					data: { orderStatus: OrderStatus.processing },
				});
			}

			if (nextStatus === PaymentStatus.refunded && payment.order.orderStatus !== OrderStatus.cancelled && payment.order.orderStatus !== OrderStatus.delivered) {
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
				await tx.order.update({ where: { id: payment.order.id }, data: { orderStatus: OrderStatus.cancelled } });
			}

			return updated;
		});

		// Tạo vận đơn GHN đặt SAU KHI transaction đổi trạng thái payment đã commit thành công — tiền
		// đã thu thật, không nên rollback việc đó chỉ vì bước phụ (tạo vận đơn) gặp lỗi. Lỗi ở đây
		// được log lại để xử lý thủ công, KHÔNG ném ngược lên caller (IPN vẫn phải ACK bình thường
		// để gateway không gọi lại). "failed" KHÔNG tự hủy đơn ở đây: payment.utils.ts cho phép
		// failed -> pending (khách thử thanh toán lại đúng đơn này), nên đơn vẫn giữ nguyên "pending"
		// và tồn kho vẫn đang giữ chỗ cho lần thử lại — không có vận đơn GHN nào được tạo lúc này
		// (xem checkout()), nên không có dữ liệu "ảo" bên GHN.
		if (nextStatus === PaymentStatus.completed) {
			try {
				await orderService.createShipmentAfterPayment(payment.order.id);
			} catch (error: any) {
				console.error(`[payment] Tạo vận đơn GHN sau khi thanh toán thành công thất bại cho orderId=${payment.order.id}:`, error?.message ?? error);
				// Tiền đã thu thật nhưng chưa tạo được vận đơn -> cần admin can thiệp thủ công. Bọc
				// try/catch riêng: bắn thông báo thất bại KHÔNG được phép làm hỏng luồng thanh toán
				// chính đã thành công (cùng tinh thần với dispatch() ở notification.service.ts).
				try {
					await notificationService.notifyAdminSystemAlert(
						"Lỗi tạo vận đơn GHN",
						`Đơn hàng ${payment.order.orderNumber} đã thanh toán thành công nhưng tạo vận đơn GHN thất bại. Cần kiểm tra và tạo vận đơn thủ công.`,
					);
				} catch (notifyError) {
					console.error(`[payment] Bắn cảnh báo hệ thống cho lỗi tạo vận đơn GHN cũng thất bại:`, notifyError);
				}
			}
		}

		// "Thanh toán lỗi" — bắn cho admin/manager mỗi khi 1 giao dịch chuyển sang "failed" (IPN
		// gateway báo thất bại hoặc staff tự cập nhật thủ công). Best-effort, không rollback payment.
		if (nextStatus === PaymentStatus.failed) {
			await notificationService.notifyAdminPaymentFailed(payment.order.id, payment.order.orderNumber);
		}

		// MỚI — thông báo cho CHÍNH KHÁCH biết kết quả thanh toán. Trước đây các hàm
		// notifyPaymentCompleted/notifyPaymentFailed/notifyPaymentRefunded (notification.service.ts)
		// đã được viết sẵn nhưng CHƯA TỪNG được gọi ở đâu, nên khách hàng không hề nhận được thông báo
		// "Thanh toán thành công/thất bại/Hoàn tiền" — thông báo duy nhất họ thấy là "Đặt hàng thành
		// công" bắn lúc tạo đơn (checkout(), TRƯỚC khi thanh toán), dễ gây hiểu lầm là đơn đã thanh
		// toán xong dù DB vẫn "pending". Best-effort (try/catch riêng trong dispatch() của
		// notification.service), không được phép làm fail luồng thanh toán chính.
		if (payment.order.userId) {
			if (nextStatus === PaymentStatus.completed) {
				await notificationService.notifyPaymentCompleted(payment.order.userId, payment.order.id, payment.order.orderNumber);
			} else if (nextStatus === PaymentStatus.failed) {
				await notificationService.notifyPaymentFailed(payment.order.userId, payment.order.id, payment.order.orderNumber);
			} else if (nextStatus === PaymentStatus.refunded) {
				await notificationService.notifyPaymentRefunded(payment.order.userId, payment.order.id, payment.order.orderNumber);
			}
		}

		return result;
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
