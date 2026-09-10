/** Một dòng giỏ hàng kèm thông tin SKU/sản phẩm cần thiết để tính tổng tiền */
interface CartItemForTotals {
    quantity: number;
    productSku: {
        price: unknown;
    };
}
/** Tính tổng số lượng và tổng tiền (subtotal) của giỏ hàng từ danh sách items đã include productSku */
export declare function computeCartTotals(items: CartItemForTotals[]): {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
};
export {};
//# sourceMappingURL=cart.utils.d.ts.map