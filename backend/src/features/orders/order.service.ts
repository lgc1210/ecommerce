import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { normalizeCouponCode, checkCouponUsability, computeDiscountAmount } from "../coupons/coupon.utils.js";
import { PAYMENT_STATUS } from "../payments/payment.constant.js";
import { ORDER_STATUS, type PAYMENT_METHOD } from "./order.constant.js";
import {
	generateOrderNumber,
	computeShippingFee,
	isValidOrderStatusTransition,
	isCancellation,
	type OrderStatus,
} from "./order.utils.js";

type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

interface CreateOrderInput {
	shippingAddressId: number;
	paymentMethod: PaymentMethod;
	couponCode?: string;
}

interface ListOwnOrdersParams {
	page?: string;
	limit?: string;
	status?: string;
}

interface ListOrdersAdminParams {
	page?: string;
	limit?: string;
	status?: string;
	userId?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

const orderItemInclude = {
	items: {
		include: {
			productSku: {
				include: { product: { select: { id: true, name: true, slug: true } } },
			},
		},
	},
};

const orderDetailInclude = {
	...orderItemInclude,
	user: { select: { id: true, name: true, email: true, phone: true } },
	shippingAddress: true,
	coupon: { select: { id: true, code: true, discountType: true, discountValue: true } },
	payment: true,
};

const orderListInclude = {
	user: { select: { id: true, name: true, email: true } },
	payment: { select: { paymentMethod: true, paymentStatus: true } },
	_count: { select: { items: true } },
};

class OrderService {
	// ==========================================
	// Self-service: checkout
	// ==========================================
	/** Tạo đơn hàng từ giỏ hàng hiện tại của user, trừ tồn kho, áp coupon (nếu có), rồi xóa giỏ hàng. Toàn bộ trong 1 transaction. */
	async checkout(userId: number, data: CreateOrderInput) {
		const address = await prisma.userAddress.findUnique({ where: { id: data.shippingAddressId } });
		if (!address || address.userId !== userId) {
			throw new Error("NotFound: Địa chỉ giao hàng không tồn tại hoặc không thuộc về bạn.");
		}

		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						productSku: {
							include: {
								product: {
									select: {
										isActive: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!cart || cart.items.length === 0) {
			throw new Error("BadRequest: Giỏ hàng đang trống, không thể đặt hàng.");
		}

		for (const item of cart.items) {
			if (!item.productSku || (item.productSku.product && !item.productSku.product.isActive)) {
				throw new Error("BadRequest: Một số sản phẩm trong giỏ hàng đã ngừng kinh doanh, vui lòng cập nhật giỏ hàng.");
			}
			if (item.quantity > item.productSku.stockQuantity) {
				throw new Error(
					`BadRequest: Sản phẩm "${item.productSku.sku}" chỉ còn ${item.productSku.stockQuantity} trong kho.`,
				);
			}
		}

		const subtotalAmount = cart.items.reduce((sum, item) => sum + Number(item.productSku.price) * item.quantity, 0);

		let couponId: number | null = null;
		let couponUsageLimit: number | null = null;
		let discountAmount = 0;

		if (data.couponCode) {
			const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCouponCode(data.couponCode) } });
			if (!coupon) {
				throw new Error("NotFound: Mã giảm giá không tồn tại.");
			}

			const usability = checkCouponUsability(coupon);
			if (!usability.valid) {
				throw new Error(`BadRequest: ${usability.reason}`);
			}
			if (subtotalAmount < Number(coupon.minOrderValue)) {
				throw new Error(
					`BadRequest: Đơn hàng tối thiểu ${Number(coupon.minOrderValue).toLocaleString("vi-VN")}đ để áp dụng mã này.`,
				);
			}

			couponId = coupon.id;
			couponUsageLimit = coupon.usageLimit;
			discountAmount = computeDiscountAmount(coupon, subtotalAmount);
		}

		const shippingFee = computeShippingFee(subtotalAmount);
		const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingFee);

		const order = await prisma.$transaction(async (tx) => {
			// Trừ tồn kho từng SKU, kiểm tra lại 1 lần nữa trong transaction để tránh race condition (2 request đặt hàng cùng lúc)
			for (const item of cart.items) {
				const updated = await tx.productSku.updateMany({
					where: { id: item.productSkuId, stockQuantity: { gte: item.quantity } },
					data: { stockQuantity: { decrement: item.quantity } },
				});
				if (updated.count === 0) {
					throw new Error(`BadRequest: Sản phẩm "${item.productSku.sku}" vừa hết hàng, vui lòng thử lại.`);
				}
			}

			if (couponId !== null) {
				// BUG FIX: update có điều kiện thay vì increment vô điều kiện, để tránh race
				// condition khi nhiều request checkout cùng dùng 1 coupon sắp hết lượt chạy
				// song song - trước đó usedCount có thể vượt quá usageLimit vì usability đã
				// được kiểm tra trước transaction (không atomic).
				const couponUpdate = await tx.coupon.updateMany({
					where: {
						id: couponId,
						OR: [{ usageLimit: null }, { usedCount: { lt: couponUsageLimit as number } }],
					},
					data: { usedCount: { increment: 1 } },
				});
				if (couponUpdate.count === 0) {
					throw new Error("BadRequest: Mã giảm giá vừa hết lượt sử dụng, vui lòng thử lại.");
				}
			}

			const createdOrder = await tx.order.create({
				data: {
					userId,
					shippingAddressId: data.shippingAddressId,
					couponId,
					orderNumber: generateOrderNumber(),
					subtotalAmount,
					discountAmount,
					shippingFee,
					totalAmount,
					orderStatus: ORDER_STATUS.pending,
					items: {
						create: cart.items.map((item) => ({
							productSkuId: item.productSkuId,
							quantity: item.quantity,
							priceAtPurchase: item.productSku.price,
							variationSnapshot: item.productSku.variationDetails as object,
						})),
					},
					payment: {
						create: {
							paymentMethod: data.paymentMethod,
							paymentStatus: PAYMENT_STATUS.pending,
							amount: totalAmount,
						},
					},
				},
				include: orderDetailInclude,
			});

			await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

			return createdOrder;
		});

		return order;
	}

	// ==========================================
	// Self-service: xem & hủy đơn của chính mình
	// ==========================================
	async listOwnOrders(userId: number, params: ListOwnOrdersParams) {
		const where: Record<string, unknown> = { userId };
		if (params.status) where.orderStatus = params.status;

		const { page, limit, skip } = parsePagination(params);
		const [orders, total] = await Promise.all([
			prisma.order.findMany({ where, include: orderListInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
			prisma.order.count({ where }),
		]);

		return {
			data: orders,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getOwnOrderById(userId: number, orderId: number) {
		const order = await this.getOrderOrThrow(orderId, orderDetailInclude);
		if (order.userId !== userId) {
			throw new Error("NotFound: Đơn hàng không tồn tại.");
		}
		return order;
	}

	/** Khách chỉ được tự hủy đơn khi đơn còn ở trạng thái "pending" (chưa được xử lý) */
	async cancelOwnOrder(userId: number, orderId: number) {
		const order = await this.getOrderOrThrow(orderId);
		if (order.userId !== userId) {
			throw new Error("NotFound: Đơn hàng không tồn tại.");
		}
		if (order.orderStatus !== "pending") {
			throw new Error('BadRequest: Chỉ có thể hủy đơn hàng khi đơn đang ở trạng thái "pending".');
		}

		return this.transitionOrderStatus(order, "cancelled");
	}

	// ==========================================
	// Admin
	// ==========================================
	async listOrdersAdmin(params: ListOrdersAdminParams) {
		const where: Record<string, unknown> = {};

		if (params.status) where.orderStatus = params.status;
		if (params.userId) where.userId = Number(params.userId);
		if (params.search) {
			where.OR = [
				{ orderNumber: { contains: params.search } },
				{ user: { email: { contains: params.search } } },
				{ user: { name: { contains: params.search } } },
			];
		}
		if (params.dateFrom || params.dateTo) {
			where.createdAt = {
				...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
				...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
			};
		}

		const { page, limit, skip } = parsePagination(params);
		const [orders, total] = await Promise.all([
			prisma.order.findMany({ where, include: orderListInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
			prisma.order.count({ where }),
		]);

		return {
			data: orders,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getOrderById(orderId: number) {
		return this.getOrderOrThrow(orderId, orderDetailInclude);
	}

	/** Staff cập nhật trạng thái xử lý đơn hàng. Khi chuyển sang "cancelled", tự động hoàn tồn kho + hoàn lượt dùng coupon. */
	async updateOrderStatus(orderId: number, status: OrderStatus) {
		const order = await this.getOrderOrThrow(orderId);
		return this.transitionOrderStatus(order, status);
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async transitionOrderStatus(
		order: { id: number; orderStatus: string; couponId: number | null },
		nextStatus: OrderStatus,
	) {
		const currentStatus = order.orderStatus as OrderStatus;

		if (!isValidOrderStatusTransition(currentStatus, nextStatus)) {
			throw new Error(`BadRequest: Không thể chuyển trạng thái đơn hàng từ "${currentStatus}" sang "${nextStatus}".`);
		}

		return prisma.$transaction(async (tx) => {
			if (isCancellation(currentStatus, nextStatus)) {
				const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
				for (const item of items) {
					if (item.productSkuId) {
						await tx.productSku.update({
							where: { id: item.productSkuId },
							data: { stockQuantity: { increment: item.quantity } },
						});
					}
				}
				if (order.couponId) {
					await tx.coupon.update({
						where: { id: order.couponId },
						data: { usedCount: { decrement: 1 } },
					});
				}
			}

			return tx.order.update({
				where: { id: order.id },
				data: { orderStatus: nextStatus },
				include: orderDetailInclude,
			});
		});
	}

	private async getOrderOrThrow(orderId: number, include?: Record<string, unknown>) {
		const order = await prisma.order.findUnique({ where: { id: orderId }, ...(include ? { include } : {}) });
		if (!order) {
			throw new Error("NotFound: Đơn hàng không tồn tại.");
		}
		return order;
	}
}

export default new OrderService();
