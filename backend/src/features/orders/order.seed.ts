import prisma from "../../config/prisma.js";
import { generateOrderNumber, computeShippingFee } from "./order.utils.js";

/**
 * Seed dữ liệu đơn hàng mẫu cho môi trường phát triển/demo.
 * Yêu cầu chạy SAU userSeed(), userAddressSeed(), productSeed() (cần userId/addressId/productSkuId đã tồn tại sẵn).
 * Chỉ chạy khi bảng orders hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn đơn hàng.
 * LƯU Ý: seed này KHÔNG trừ tồn kho tương ứng (khác với luồng checkout thật) vì chỉ phục vụ mục đích demo dữ liệu.
 */
export const orderSeed = async () => {
	const existingOrders = await prisma.order.count();
	if (existingOrders > 0) return;

	const customers = await prisma.user.findMany({ where: { role: { name: "customer" } }, take: 5, orderBy: { id: "asc" } });
	const skus = await prisma.productSku.findMany({ take: 10, orderBy: { id: "asc" } });
	if (customers.length === 0 || skus.length === 0) return;

	const sampleStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
	const samplePaymentMethods = ["cod", "vnpay", "momo"] as const;

	let skuCursor = 0;
	const nextSku = () => skus[skuCursor++ % skus.length]!;

	for (let i = 0; i < customers.length; i++) {
		const customer = customers[i]!;
		const address = await prisma.userAddress.findFirst({ where: { userId: customer.id } });
		if (!address) continue;

		const orderSkus = [nextSku(), nextSku()];
		const items = orderSkus.map((sku) => ({ sku, quantity: 1 + (i % 2) }));

		const subtotalAmount = items.reduce((sum, item) => sum + Number(item.sku.price) * item.quantity, 0);
		const discountAmount = 0;
		const shippingFee = computeShippingFee(subtotalAmount);
		const totalAmount = subtotalAmount - discountAmount + shippingFee;
		const status = sampleStatuses[i % sampleStatuses.length]!;
		const paymentMethod = samplePaymentMethods[i % samplePaymentMethods.length]!;

		await prisma.order.create({
			data: {
				userId: customer.id,
				shippingAddressId: address.id,
				couponId: null,
				orderNumber: generateOrderNumber(),
				subtotalAmount,
				discountAmount,
				shippingFee,
				totalAmount,
				orderStatus: status,
				items: {
					create: items.map((item) => ({
						productSkuId: item.sku.id,
						quantity: item.quantity,
						priceAtPurchase: item.sku.price,
						variationSnapshot: item.sku.variationDetails as object,
					})),
				},
				payment: {
					create: {
						paymentMethod,
						paymentStatus: status === "delivered" ? "completed" : status === "cancelled" ? "refunded" : "pending",
						amount: totalAmount,
						paidAt: status === "delivered" ? new Date() : null,
					},
				},
			},
		});
	}

	console.log("Seeding: Sample orders created successfully");
};
