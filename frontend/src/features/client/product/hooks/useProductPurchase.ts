import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	collectVariationAttributes,
	findMatchingSku,
	getProductThumbnail,
	getSkuImages,
} from "../utils";
import { useCart } from "../../cart/hooks";
import type { VariationDetails } from "../types";
import { toast } from "react-toastify";
import type { BuyNowSnapshot } from "../../order/types";
import paths from "../../../../configs/constants/paths";

// Derive the required product types from existing utility functions
// to avoid duplicating the product/SKU interfaces.
type ProductSkus = Parameters<typeof collectVariationAttributes>[0];

type PurchaseProduct = Parameters<typeof getProductThumbnail>[0] & {
	slug: string;
	name: string;
	skus: ProductSkus;
};

export function useProductPurchase(product: PurchaseProduct) {
	const navigate = useNavigate();

	const { addItem, isAuthenticated, isMutating } = useCart();

	const [selected, setSelected] = useState<VariationDetails>({});
	const [quantity, setQuantity] = useState(1);

	// Available variation attributes, e.g. Color, Size.
	const attributes = collectVariationAttributes(product.skus);

	// Require all attributes to be selected before resolving a SKU.
	const hasSelectedAllAttributes =
		attributes.length > 0 &&
		attributes.every((attribute) => Boolean(selected[attribute]));

	// Do not fall back to an arbitrary SKU when the combination is invalid.
	const selectedSku = hasSelectedAllAttributes
		? findMatchingSku(product.skus, selected)
		: undefined;

	const inStock = (selectedSku?.stockQuantity ?? 0) > 0;

	const isUnavailableCombination = hasSelectedAllAttributes && !selectedSku;

	const skuImages = selectedSku ? getSkuImages(selectedSku) : [];

	const image = skuImages[0] ?? getProductThumbnail(product);

	const handleSelect = (attribute: string, value: string) => {
		setSelected((previous) => ({
			...previous,
			[attribute]: value,
		}));
	};

	const handleQuantityChange = (nextQuantity: number) => {
		if (!selectedSku || !inStock) return;

		const safeQuantity = Math.max(
			1,
			Math.min(nextQuantity, selectedSku.stockQuantity),
		);

		setQuantity(safeQuantity);
	};

	const handleAddToCart = () => {
		if (!selectedSku || !inStock || !hasSelectedAllAttributes) {
			return;
		}

		if (quantity > selectedSku.stockQuantity) {
			setQuantity(selectedSku.stockQuantity);
			return;
		}

		addItem({
			productSkuId: selectedSku.id,
			productSlug: product.slug,
			productName: product.name,
			image,
			sku: selectedSku.sku,
			variationDetails: selectedSku.variationDetails,
			price: Number(selectedSku.price),
			oldPrice: Number(selectedSku.oldPrice ?? 0),
			stockQuantity: selectedSku.stockQuantity,
			quantity,
		});

		if (!isAuthenticated) {
			toast.info("Sản phẩm đã được thêm vào giỏ hàng.");
		}
	};

	const handleBuyNow = () => {
		if (!isAuthenticated) {
			toast.info("Vui lòng đăng nhập để sử dụng chức năng mua ngay.");
			return;
		}

		if (!selectedSku || !inStock || !hasSelectedAllAttributes) {
			return;
		}

		if (quantity > selectedSku.stockQuantity) {
			setQuantity(selectedSku.stockQuantity);
			return;
		}

		const snapshot: BuyNowSnapshot = {
			productSkuId: selectedSku.id,
			productSlug: product.slug,
			productName: product.name,
			image,
			sku: selectedSku.sku,
			variationDetails: selectedSku.variationDetails,
			price: Number(selectedSku.price),
			oldPrice: Number(selectedSku.oldPrice ?? 0) || null,
			stockQuantity: selectedSku.stockQuantity,
			quantity,
		};

		navigate(paths.client.buyNow, {
			state: snapshot,
			viewTransition: true,
		});
	};

	return {
		// Selection state
		selected,
		setSelected,
		quantity,
		setQuantity,

		// Variation information
		attributes,
		selectedSku,
		hasSelectedAllAttributes,
		isUnavailableCombination,
		inStock,
		image,
		skuImages,

		// Cart and authentication state
		isAuthenticated,
		isMutating,

		// Actions
		handleSelect,
		handleQuantityChange,
		handleAddToCart,
		handleBuyNow,
	};
}
