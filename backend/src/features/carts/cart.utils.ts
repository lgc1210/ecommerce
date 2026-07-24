/** Một dòng giỏ hàng kèm thông tin SKU/sản phẩm cần thiết để tính tổng tiền */
interface CartItemForTotals {
	quantity: number;
	productSku: {
		price: unknown; // Prisma.Decimal
	};
}

/** Tính tổng số lượng và tổng tiền (subtotal) của giỏ hàng từ danh sách items đã include productSku */
export function computeCartTotals(items: CartItemForTotals[]): { totalItems: number; totalQuantity: number; subtotal: number } {
	let totalQuantity = 0;
	let subtotal = 0;

	for (const item of items) {
		totalQuantity += item.quantity;
		subtotal += Number(item.productSku.price) * item.quantity;
	}

	return { totalItems: items.length, totalQuantity, subtotal };
}
