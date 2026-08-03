import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { normalizeCouponCode, checkCouponUsability, computeDiscountAmount } from "../coupons/coupon.utils.js";
import { PAYMENT_STATUS } from "../payments/payment.constant.js";
import { calculateShippingFee, createShippingOrder, cancelShippingOrder } from "../../external/ghn/ghn.service.js";
import { ORDER_STATUS, type PAYMENT_METHOD } from "./order.constant.js";
import {
	generateOrderNumber,
	computeCartPackage,
	isValidOrderStatusTransition,
	isCancellation,
	mapGhnStatusToOrderStatus,
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
				include: {
					product: { select: { id: true, name: true, slug: true } },
					images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }] },
				},
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
	/**
	 * Tạo đơn hàng từ giỏ hàng hiện tại của user, trừ tồn kho, áp coupon (nếu có). Toàn bộ trong 1
	 * transaction. LƯU Ý: KHÔNG xóa giỏ hàng sau khi đặt — khách có thể đặt lại/mua thêm từ đúng
	 * giỏ hàng cũ, việc xóa/giữ giỏ hàng là do khách tự quyết định (qua API xóa giỏ hàng riêng).
	 */
	async checkout(userId: number, data: CreateOrderInput) {
		const { address, cart, subtotalAmount } = await this.loadValidatedCartForCheckout(userId, data.shippingAddressId);

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

		const shippingFee = await this.computeShippingFeeForCart(address, cart.items, subtotalAmount);
		const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingFee);

		const order = await prisma.$transaction(
			async (tx) => {
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
					// Coupon không giới hạn lượt dùng (usageLimit = null) thì không cần điều kiện
					// usedCount < limit — Prisma báo lỗi nếu truyền lt: null.
					const couponUpdate = await tx.coupon.updateMany({
						where: {
							id: couponId,
							...(couponUsageLimit !== null ? { usedCount: { lt: couponUsageLimit } } : {}),
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

				// Tạo đơn vận chuyển thật bên GHN NGAY TRONG transaction này — "đặt hàng thành
				// công" ở hệ thống mình PHẢI đi đôi với việc tạo được đơn bên GHN. Nếu GHN tạo
				// đơn thất bại, ném lỗi ở đây sẽ rollback toàn bộ (trừ kho, dùng coupon, tạo đơn)
				// — khách sẽ thấy checkout thất bại thay vì có 1 đơn hàng "mồ côi" không có vận đơn.
				const cartPackage = computeCartPackage(cart.items);
				const shipment = await createShippingOrder({
					clientOrderCode: createdOrder.orderNumber,
					toName: address.recipientName,
					toPhone: address.phoneNumber,
					toAddress: address.addressLine,
					toWardCode: address.wardCode,
					toDistrictId: address.districtId,
					codAmount: data.paymentMethod === "cod" ? totalAmount : 0,
					insuranceValue: subtotalAmount,
					items: cart.items.map((item) => ({
						name: item.productSku.product?.name ?? item.productSku.sku,
						quantity: item.quantity,
					})),
					...cartPackage,
				});

				return tx.order.update({
					where: { id: createdOrder.id },
					data: { ghnOrderCode: shipment.orderCode, ghnStatus: "ready_to_pick" },
					include: orderDetailInclude,
				});
			},
			{ timeout: 15_000 }, // Mặc định Prisma là 5s — nới ra vì transaction này có thêm 1 lượt gọi API GHN
		);

		return order;
	}

	/**
	 * Tính trước phí vận chuyển GHN theo giỏ hàng hiện tại + địa chỉ giao hàng, dùng cho trang
	 * checkout hiển thị phí ship cho khách TRƯỚC khi họ bấm đặt hàng (không tạo đơn, không trừ tồn kho).
	 */
	async previewShippingFee(userId: number, shippingAddressId: number) {
		const { address, cart, subtotalAmount } = await this.loadValidatedCartForCheckout(userId, shippingAddressId);
		const shippingFee = await this.computeShippingFeeForCart(address, cart.items, subtotalAmount);
		return { subtotalAmount, shippingFee };
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

	/**
	 * Nhận cập nhật trạng thái vận chuyển từ GHN qua webhook (server-to-server, GHN gọi trực tiếp,
	 * không qua người dùng). Luôn lưu lại `ghnStatus` thô; chỉ tự chuyển `orderStatus` nội bộ khi
	 * trạng thái GHN đủ rõ ràng để map (xem mapGhnStatusToOrderStatus) và đơn CHƯA ở trạng thái
	 * cuối (delivered/cancelled) — một khi đã ở trạng thái cuối thì không cho GHN đổi ngược lại nữa
	 * (vd. GHN báo "return" sau khi đơn đã được đánh dấu "delivered" thủ công).
	 */
	async syncFromGhnWebhook(ghnOrderCode: string, ghnStatus: string) {
		const order = await prisma.order.findUnique({ where: { ghnOrderCode }, include: { payment: true } });
		if (!order) return; // Không thuộc hệ thống này (hoặc sai mã) — bỏ qua, vẫn trả 200 để GHN không retry vô ích

		const currentStatus = order.orderStatus as OrderStatus;
		const isTerminal = currentStatus === ORDER_STATUS.delivered || currentStatus === ORDER_STATUS.cancelled;
		const mappedStatus = mapGhnStatusToOrderStatus(ghnStatus);

		if (!isTerminal && mappedStatus && mappedStatus !== currentStatus) {
			await this.transitionOrderStatus(order, mappedStatus, { source: "ghn-webhook", ghnStatus });

			// COD: khách trả tiền mặt trực tiếp cho shipper ngay lúc nhận hàng, nên "giao thành
			// công" ĐỒNG NGHĨA với "đã thu tiền" -> tự động hoàn tất luôn payment ở đây. Việc GHN
			// có đối soát/chuyển khoản tiền COD đó về cho shop hay chưa là công nợ nội bộ giữa
			// Shop <-> GHN (theo chu kỳ đối soát riêng), KHÔNG liên quan tới trạng thái thanh toán
			// hiển thị cho khách trên đơn này.
			if (
				mappedStatus === ORDER_STATUS.delivered &&
				order.payment?.paymentMethod === "cod" &&
				order.payment.paymentStatus !== PAYMENT_STATUS.completed
			) {
				await prisma.payment.update({
					where: { orderId: order.id },
					data: { paymentStatus: PAYMENT_STATUS.completed, paidAt: new Date() },
				});
			}
		} else {
			await prisma.order.update({ where: { id: order.id }, data: { ghnStatus } });
		}
	}

	// ==========================================
	// Helpers
	// ==========================================
	/**
	 * Kiểm tra địa chỉ giao hàng thuộc về đúng user, load giỏ hàng hiện tại và validate từng dòng
	 * (còn kinh doanh, đủ tồn kho). Dùng chung cho cả checkout() lẫn previewShippingFee() để tránh
	 * lặp lại logic và đảm bảo phí ship xem trước luôn khớp với phí ship lúc đặt hàng thật.
	 */
	private async loadValidatedCartForCheckout(userId: number, shippingAddressId: number) {
		const address = await prisma.userAddress.findUnique({ where: { id: shippingAddressId } });
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
										name: true,
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

		return { address, cart, subtotalAmount };
	}

	/** Gọi GHN để tính phí vận chuyển thực tế theo địa chỉ đích + khối lượng/kích thước thật của giỏ hàng. */
	private async computeShippingFeeForCart(
		address: { districtId: number; wardCode: string },
		cartItems: {
			quantity: number;
			productSku: { weightGram: number; lengthCm: number; widthCm: number; heightCm: number };
		}[],
		subtotalAmount: number,
	) {
		const cartPackage = computeCartPackage(cartItems);
		return calculateShippingFee({
			toDistrictId: address.districtId,
			toWardCode: address.wardCode,
			...cartPackage,
			insuranceValue: subtotalAmount,
		});
	}

	/**
	 * @param options.source "internal" (mặc định, do admin/khách chủ động đổi) bắt buộc theo đúng
	 * ALLOWED_TRANSITIONS và tự đồng bộ hủy đơn sang GHN nếu đơn đã có vận đơn. "ghn-webhook" (do
	 * syncFromGhnWebhook gọi) bỏ qua kiểm tra graph — GHN là nguồn sự thật bên vận chuyển — và
	 * KHÔNG gọi lại cancelShippingOrder (tránh gọi ngược lại chính nơi vừa báo cho mình).
	 */
	private async transitionOrderStatus(
		order: { id: number; orderStatus: string; couponId: number | null; ghnOrderCode?: string | null },
		nextStatus: OrderStatus,
		options: { source?: "internal" | "ghn-webhook"; ghnStatus?: string } = {},
	) {
		const currentStatus = order.orderStatus as OrderStatus;
		const source = options.source ?? "internal";

		if (source === "internal" && !isValidOrderStatusTransition(currentStatus, nextStatus)) {
			throw new Error(`BadRequest: Không thể chuyển trạng thái đơn hàng từ "${currentStatus}" sang "${nextStatus}".`);
		}

		// Hủy đơn do NGƯỜI DÙNG/ADMIN chủ động (không phải do webhook GHN báo về): phải hủy được
		// bên GHN trước. Nếu đơn chưa có vận đơn (ghnOrderCode null, hiếm khi xảy ra vì checkout()
		// luôn tạo cùng lúc) thì bỏ qua bước này. Nếu GHN từ chối hủy (đã lấy hàng/đang giao) thì
		// ném lỗi ngay, KHÔNG cho hủy ở hệ thống mình nữa — giữ đồng bộ giữa 2 bên.
		if (source === "internal" && isCancellation(currentStatus, nextStatus) && order.ghnOrderCode) {
			await cancelShippingOrder(order.ghnOrderCode);
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
				data: { orderStatus: nextStatus, ...(options.ghnStatus ? { ghnStatus: options.ghnStatus } : {}) },
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
