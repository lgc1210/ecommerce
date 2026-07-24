import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import cartService from "../services";
import { useCartStore } from "../stores";
import { useAuth } from "../../../auth/hooks/useAuth";
import { getApiErrorMessage } from "../../../../utils/api";
import { computeSubtotal, computeTotalQuantity, toLocalCartLineView, toServerCartLineView } from "../utils";
import { CART_QUERY_KEY } from "../constants";
import type { AddToCartPayload, CartLineView, ServerCart } from "../types";

// ==========================================
// Server cart (khách đã đăng nhập) — query + mutations gọi thẳng /cart API
//
// Lưu ý: KHÔNG có hook đồng bộ giỏ hàng cục bộ (localStorage) vào DB ở đây — việc đó chỉ xảy
// ra đúng 1 lần tại thời điểm đăng nhập (gửi kèm `cartItems` trong payload login/google/
// facebook), được xử lý ngay trong AuthService ở backend và trong useLogin/useGoogleAuthLogin/
// useFacebookAuthLogin ở features/auth/hooks/useAuth.ts, không phải qua endpoint /cart riêng.
// ==========================================
export const useCartQuery = (options: { enabled?: boolean } = {}) => {
	return useQuery<ServerCart>({
		queryKey: CART_QUERY_KEY,
		queryFn: async () => {
			const res = await cartService.getCart();
			return res.data.data;
		},
		enabled: options.enabled ?? true,
	});
};

export const useAddCartItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: { productSkuId: number; quantity: number }) => cartService.addItem(payload),
		onSuccess: (res) => {
			queryClient.setQueryData(CART_QUERY_KEY, res.data.data);
			toast.success(res.data.message ?? "Đã thêm sản phẩm vào giỏ hàng.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể thêm sản phẩm vào giỏ hàng."));
		},
	});
};

export const useUpdateCartItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
			cartService.updateItemQuantity(itemId, quantity),
		onSuccess: (res) => {
			queryClient.setQueryData(CART_QUERY_KEY, res.data.data);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể cập nhật số lượng."));
		},
	});
};

export const useRemoveCartItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (itemId: number) => cartService.removeItem(itemId),
		onSuccess: (res) => {
			queryClient.setQueryData(CART_QUERY_KEY, res.data.data);
			toast.success(res.data.message ?? "Đã xóa sản phẩm khỏi giỏ hàng.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể xóa sản phẩm."));
		},
	});
};

export const useClearCartMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => cartService.clearCart(),
		onSuccess: () => {
			// Backend trả về mỗi message cho DELETE /cart (không kèm cart rỗng) -> yêu cầu
			// react-query lấy lại dữ liệu mới nhất thay vì tự dựng shape ServerCart rỗng ở đây.
			queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
			toast.success("Xoá giỏ hàng thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Không thể xóa giỏ hàng."));
		},
	});
};

/**
 * Hook hợp nhất cho toàn bộ UI giỏ hàng (header, trang /cart, nút "Thêm vào giỏ" ở trang chi
 * tiết sản phẩm): tự chọn nguồn dữ liệu (giỏ hàng cục bộ hay giỏ hàng server) dựa theo trạng
 * thái đăng nhập, để component gọi không cần tự rẽ nhánh isAuthenticated.
 */
export function useCart() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const cartQuery = useCartQuery({ enabled: isAuthenticated });

	const localItems = useCartStore((state) => state.items);
	const addLocalItem = useCartStore((state) => state.addItem);
	const updateLocalQuantity = useCartStore((state) => state.updateQuantity);
	const removeLocalItem = useCartStore((state) => state.removeItem);
	const clearLocalCart = useCartStore((state) => state.clearCart);

	const addServerItem = useAddCartItemMutation();
	const updateServerItem = useUpdateCartItemMutation();
	const removeServerItem = useRemoveCartItemMutation();
	const clearServerCart = useClearCartMutation();

	const items: CartLineView[] = isAuthenticated
		? (cartQuery.data?.items ?? []).map(toServerCartLineView)
		: localItems.map(toLocalCartLineView);

	const isLoading = authLoading || (isAuthenticated && cartQuery.isLoading);

	const addItem = (payload: AddToCartPayload) => {
		const quantity = payload.quantity ?? 1;
		if (isAuthenticated) {
			addServerItem.mutate({ productSkuId: payload.productSkuId, quantity });
			return;
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- tách quantity ra khỏi payload, addLocalItem nhận quantity riêng ở tham số thứ 2
		const { quantity: _quantity, ...snapshot } = payload;
		addLocalItem(snapshot, quantity);
	};

	const updateQuantity = (line: CartLineView, quantity: number) => {
		if (isAuthenticated && line.itemId) {
			updateServerItem.mutate({ itemId: line.itemId, quantity });
			return;
		}
		updateLocalQuantity(line.productSkuId, quantity);
	};

	const removeItem = (line: CartLineView) => {
		if (isAuthenticated && line.itemId) {
			removeServerItem.mutate(line.itemId);
			return;
		}
		removeLocalItem(line.productSkuId);
	};

	const clearCart = () => {
		if (isAuthenticated) {
			clearServerCart.mutate();
			return;
		}
		clearLocalCart();
	};

	return {
		items,
		totalQuantity: computeTotalQuantity(items),
		subtotal: computeSubtotal(items),
		isLoading,
		isAuthenticated,
		addItem,
		updateQuantity,
		removeItem,
		clearCart,
		isMutating:
			addServerItem.isPending || updateServerItem.isPending || removeServerItem.isPending || clearServerCart.isPending,
	};
}
