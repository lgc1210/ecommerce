import apiClient from "../../../../configs/apis";

const cartService = {
	getCart: () => apiClient.get("/cart"),
	addItem: (data: { productSkuId: number; quantity: number }) => apiClient.post("/cart/items", data),
	updateItemQuantity: (itemId: number, quantity: number) => apiClient.patch(`/cart/items/${itemId}`, { quantity }),
	removeItem: (itemId: number) => apiClient.delete(`/cart/items/${itemId}`),
	clearCart: () => apiClient.delete("/cart"),
};

export default cartService;
