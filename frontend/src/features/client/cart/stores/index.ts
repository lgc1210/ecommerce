import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { LocalCartItem } from "../types";

interface CartState {
	items: LocalCartItem[];
	/**
	 * Thêm 1 SKU vào giỏ; nếu SKU đã có trong giỏ thì cộng dồn số lượng (chặn trần theo
	 * `stockQuantity` snapshot lúc thêm — chỉ mang tính tham khảo, tồn kho thật được backend
	 * xác thực lại khi đồng bộ vào DB hoặc khi đặt hàng).
	 */
	addItem: (item: Omit<LocalCartItem, "quantity">, quantity?: number) => void;
	/** Xoá hẳn 1 dòng khỏi giỏ hàng theo productSkuId. */
	removeItem: (productSkuId: number) => void;
	/** Đặt lại số lượng cho 1 dòng theo productSkuId; số lượng <= 0 sẽ xoá luôn dòng đó. */
	updateQuantity: (productSkuId: number, quantity: number) => void;
	/** Xoá sạch giỏ hàng cục bộ — dùng sau khi đồng bộ (merge) thành công vào DB lúc đăng nhập. */
	clearCart: () => void;
}

/**
 * Giỏ hàng của khách CHƯA đăng nhập, dùng zustand + middleware "persist" (localStorage) vì
 * các endpoint /cart ở backend đều yêu cầu authenticateJWT. Giỏ hàng lưu theo `productSkuId`
 * (khớp domain CartItem ở backend, tính theo biến thể) kèm snapshot dữ liệu hiển thị (tên, ảnh,
 * giá, tồn kho) để trang giỏ hàng tự render mà không cần gọi API.
 *
 * Khi user đăng nhập, `useCartSync()` (xem features/client/cart/hooks) sẽ tự động gọi
 * POST /cart/merge với toàn bộ `items` hiện có, sau đó gọi `clearCart()` để giỏ hàng cục bộ
 * nhường vai trò "nguồn sự thật" lại cho server. Từ lúc này useCart() sẽ đọc/ghi qua server,
 * không đụng tới store này nữa cho tới khi user đăng xuất.
 */
export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			addItem: (item, quantity = 1) => {
				set((state) => {
					const existing = state.items.find((line) => line.productSkuId === item.productSkuId);
					if (existing) {
						const nextQuantity = Math.min(existing.quantity + quantity, existing.stockQuantity);
						return {
							items: state.items.map((line) =>
								line.productSkuId === item.productSkuId ? { ...line, ...item, quantity: nextQuantity } : line,
							),
						};
					}
					return {
						items: [...state.items, { ...item, quantity: Math.min(quantity, item.stockQuantity) }],
					};
				});
			},
			removeItem: (productSkuId) => {
				set((state) => ({
					items: state.items.filter((line) => line.productSkuId !== productSkuId),
				}));
			},
			updateQuantity: (productSkuId, quantity) =>
				set((state) => ({
					items:
						quantity <= 0
							? state.items.filter((line) => line.productSkuId !== productSkuId)
							: state.items.map((line) =>
									line.productSkuId === productSkuId
										? { ...line, quantity: Math.min(quantity, line.stockQuantity) }
										: line,
								),
				})),
			clearCart: () => {
				set({ items: [] });
			},
		}),
		{
			name: "ecommerce-cart-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
