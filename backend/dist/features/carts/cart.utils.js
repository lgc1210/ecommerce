/** Tính tổng số lượng và tổng tiền (subtotal) của giỏ hàng từ danh sách items đã include productSku */
export function computeCartTotals(items) {
    let totalQuantity = 0;
    let subtotal = 0;
    for (const item of items) {
        totalQuantity += item.quantity;
        subtotal += Number(item.productSku.price) * item.quantity;
    }
    return { totalItems: items.length, totalQuantity, subtotal };
}
//# sourceMappingURL=cart.utils.js.map