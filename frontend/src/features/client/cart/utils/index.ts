import { getProductThumbnail, getSkuImages } from "../../product/utils";
import type { CartLineView, LocalCartItem, ServerCartItem } from "../types";

const FALLBACK_IMAGE = "https://placehold.co/600x600/f3ede4/1c1815?font=montserrat&text=San+pham";

/** Chuyển 1 dòng giỏ hàng SERVER (đã đăng nhập, từ GET /cart) sang shape hợp nhất để render. */
export function toServerCartLineView(item: ServerCartItem): CartLineView {
	const product = item.productSku.product;
	// Ưu tiên ảnh riêng của SKU/biến thể (vd. ảnh màu "Đen" khác màu "Xám") — khớp đúng sản phẩm
	// khách đã chọn, giống trang chi tiết sản phẩm; nếu SKU chưa có ảnh riêng thì rơi về ảnh đại
	// diện chung của sản phẩm, cuối cùng mới tới placeholder.
	const image = getSkuImages(item.productSku)[0] ?? (product ? getProductThumbnail(product) : FALLBACK_IMAGE);
	return {
		id: `server-${item.id}`,
		itemId: item.id,
		productSkuId: item.productSkuId,
		productSlug: product?.slug ?? "",
		productName: product?.name ?? "Sản phẩm không xác định",
		image,
		sku: item.productSku.sku,
		variationDetails: item.productSku.variationDetails,
		price: Number(item.productSku.price),
		quantity: item.quantity,
		stockQuantity: item.productSku.stockQuantity,
		inStock: Boolean(product?.isActive) && item.productSku.stockQuantity > 0,
	};
}

/** Chuyển 1 dòng giỏ hàng CỤC BỘ (chưa đăng nhập, từ zustand/localStorage) sang shape hợp nhất để render. */
export function toLocalCartLineView(item: LocalCartItem): CartLineView {
	return {
		id: `local-${item.productSkuId}`,
		productSkuId: item.productSkuId,
		productSlug: item.productSlug,
		productName: item.productName,
		image: item.image,
		sku: item.sku,
		variationDetails: item.variationDetails,
		price: item.price,
		quantity: item.quantity,
		stockQuantity: item.stockQuantity,
		// Giỏ hàng cục bộ chỉ có snapshot tại thời điểm thêm vào giỏ, không có cách nào xác thực lại
		// tồn kho/tình trạng kinh doanh theo thời gian thực mà không gọi thêm API -> mặc định coi là
		// còn hàng, tồn kho thật sẽ được backend kiểm tra lại khi merge vào DB hoặc khi đặt hàng.
		inStock: true,
	};
}

/** Tổng số lượng sản phẩm (cộng dồn quantity) trong danh sách dòng giỏ hàng. */
export function computeTotalQuantity(lines: CartLineView[]): number {
	return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Tổng tiền (subtotal) của danh sách dòng giỏ hàng. */
export function computeSubtotal(lines: CartLineView[]): number {
	return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
