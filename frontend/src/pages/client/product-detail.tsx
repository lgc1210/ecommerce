import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { formatCurrency } from "../../utils/currency";
import { CartIcon, ShieldCheckIcon, StarIcon, TruckIcon } from "../../components/icons";
import VariationSelector from "../../features/client/product/components/variation-selector";
import { useProductBySlugQuery } from "../../features/client/product/hooks";
import { collectVariationAttributes, findMatchingSku, getProductThumbnail, getSkuImages, toProductCardItem } from "../../features/client/product/utils";
import type { VariationDetails } from "../../features/client/product/types";
import { useCart } from "../../features/client/cart/hooks";
import ProductCard from "../../features/client/product/components/product-card";
import { TabItem, Tabs } from "../../components/tabs";
import QuantityStepper from "../../shared/components/quantity-stepper";

const tabs = [
	{ id: "description", label: "Mô tả" },
	{ id: "specs", label: "Thông số" },
	{ id: "reviews", label: "Đánh giá" },
] as const;

const ProductDetailPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const { data: product, isLoading, isError } = useProductBySlugQuery(slug);
	const { addItem, isAuthenticated, isMutating } = useCart();

	const [selected, setSelected] = useState<VariationDetails>({});
	const [activeImage, setActiveImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("description");

	// Theo dõi slug đã đồng bộ state gần nhất, để phát hiện khi product vừa tải xong hoặc đổi
	// sang sản phẩm khác. Dùng pattern "điều chỉnh state khi render" (thay vì useEffect + setState)
	// để tránh gây thêm 1 vòng render/paint không cần thiết (cascading renders).
	// Xem: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
	const [syncedSlug, setSyncedSlug] = useState<string | undefined>(undefined);
	if (product && product.slug !== syncedSlug) {
		setSyncedSlug(product.slug);
		setSelected({});
		setActiveImage(0);
		setQuantity(1);
	}

	if (isLoading) {
		return <div className='mx-auto max-w-7xl px-4 py-24 text-center text-muted sm:px-6 lg:px-8'>Đang tải sản phẩm...</div>;
	}

	if (isError || !product) {
		return (
			<div className='mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8'>
				<h1 className='text-2xl font-bold text-ink'>Không tìm thấy sản phẩm</h1>
				<p className='mt-2 text-muted'>Sản phẩm bạn tìm không tồn tại hoặc đã ngừng kinh doanh.</p>
				<Link to={paths.client.shop}>
					<Button className='mt-6'>Quay lại cửa hàng</Button>
				</Link>
			</div>
		);
	}

	const attributes = collectVariationAttributes(product.skus);
	// KHÔNG fallback về pickDefaultSku() ở đây — pickDefaultSku chỉ dùng để chọn SKU MẶC ĐỊNH
	// lúc mới vào trang (xem effect syncedSlug ở trên). Nếu tổ hợp người dùng đang chọn không
	// khớp SKU nào (vd: chọn "Xanh" nhưng Xanh chỉ tồn tại ở dung lượng khác), selectedSku phải
	// là undefined để UI phản ánh đúng "không có tổ hợp này" — fallback về SKU khác sẽ khiến giá/
	// tồn kho/ảnh hiển thị nhầm sang 1 tổ hợp mà khách không hề chọn, và có thể khiến khách thêm
	// nhầm sản phẩm vào giỏ.
	const hasSelectedAllAttributes = attributes.length > 0 && attributes.every((attribute) => Boolean(selected[attribute]));
	const selectedSku = findMatchingSku(product.skus, selected);
	const images = selectedSku ? getSkuImages(selectedSku) : [];
	const gallery = images.length > 0 ? images : [getProductThumbnail(product)];
	const price = selectedSku ? Number(selectedSku.price) : 0;
	const oldPrice = selectedSku ? Number(selectedSku.oldPrice ?? 0) : 0;
	const inStock = (selectedSku?.stockQuantity ?? 0) > 0;
	const isUnavailableCombination = !selectedSku;
	// Chỉ có tối đa 20 review gần nhất được backend trả về (xem productDetailInclude ở product.service.ts),
	// nên đây là số lượng review đang hiển thị, không hẳn là tổng số review thực tế của sản phẩm.
	const reviewCount = product.reviews.length;
	const related = product.related;

	const handleSelect = (attribute: string, value: string) => {
		setSelected((prev) => ({ ...prev, [attribute]: value }));
		setActiveImage(0);
	};

	const handleAddToCart = () => {
		if (!selectedSku || !inStock) return;
		addItem({
			productSkuId: selectedSku.id,
			productSlug: product.slug,
			productName: product.name,
			image: gallery[0] ?? getProductThumbnail(product),
			sku: selectedSku.sku,
			variationDetails: selectedSku.variationDetails,
			price: Number(selectedSku.price),
			oldPrice: Number(selectedSku.oldPrice ?? 0),
			stockQuantity: selectedSku.stockQuantity,
			quantity,
		});
		// Khách đã đăng nhập sẽ có toast riêng từ useAddCartItemMutation (kèm message thật từ backend);
		// khách chưa đăng nhập thêm vào giỏ cục bộ không qua API nên toast ở đây.
		if (!isAuthenticated) toast.success("Đã thêm vào giỏ hàng.");
	};

	return (
		<div>
			<BreadCrumb title={product.name} />

			<div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
				<div className='grid gap-10 lg:grid-cols-2'>
					{/* Gallery */}
					<div>
						<div className='aspect-square overflow-hidden rounded-2xl bg-cream-soft'>
							<img src={gallery[activeImage]} alt={product.name} className='h-full w-full object-cover' style={{ viewTransitionName: `product-img-${product.slug}` }} />
						</div>
						{gallery.length > 1 && (
							<div className='mt-4 grid grid-cols-3 gap-3'>
								{gallery.map((img, index) => (
									<button
										key={img + index}
										type='button'
										onClick={() => setActiveImage(index)}
										className={`aspect-square overflow-hidden rounded-xl border-2 ${activeImage === index ? "border-primary" : "border-transparent"}`}>
										<img src={img} alt={`${product.name} ${index + 1}`} className='h-full w-full object-cover' />
									</button>
								))}
							</div>
						)}
					</div>

					{/* Info */}
					<div>
						{product.averageRating !== null && (
							<div className='flex items-center gap-1 text-primary'>
								{Array.from({ length: 5 }).map((_, i) => (
									<StarIcon key={i} className={`h-4 w-4 ${i < Math.round(product.averageRating!) ? "text-primary" : "text-border"}`} />
								))}
								<span className='ml-2 text-sm text-muted'>
									{product.averageRating!.toFixed(1)} ({reviewCount} đánh giá)
								</span>
							</div>
						)}

						<h1 className='mt-3 text-3xl font-extrabold tracking-tight text-ink' style={{ viewTransitionName: `product-title-${product.name}` }}>
							{product.name}
						</h1>

						<div className='mt-4 flex items-center gap-3'>
							{Boolean(oldPrice) && <span className='text-xl text-muted line-through'>{formatCurrency(oldPrice)}</span>}
							<span className='text-3xl font-bold text-primary-dark'>{formatCurrency(price)}</span>
						</div>

						{product.description && <p className='mt-5 leading-relaxed text-muted'>{product.description}</p>}

						<div className='mt-6 flex items-center gap-2 text-sm'>
							<span className={`h-2 w-2 rounded-full ${inStock ? "bg-green-600" : "bg-red-500"}`} />
							{isUnavailableCombination ? (
								<span className='text-red-600'>Không có sẵn tổ hợp này, vui lòng chọn lựa chọn khác</span>
							) : inStock ? (
								<span className='text-ink'>Còn hàng ({selectedSku.stockQuantity})</span>
							) : (
								<span className='text-red-600'>Tạm hết hàng</span>
							)}
						</div>

						{/* Chọn biến thể (màu/size...) */}
						{attributes.length > 0 && (
							<div className='mt-6 space-y-5'>
								{attributes.map((attribute) => (
									<VariationSelector key={attribute} attribute={attribute} skus={product.skus} selected={selected} onSelect={handleSelect} />
								))}
							</div>
						)}

						<div className='mt-8 flex flex-wrap items-center gap-2 select-none'>
							<QuantityStepper value={quantity} max={selectedSku?.stockQuantity ?? 1} disabled={!selectedSku || !inStock} onChange={setQuantity} />
							<Button type='button' disabled={!inStock || isMutating} onClick={handleAddToCart} icon={<CartIcon className='h-4 w-4' />} iconPosition='left'>
								{!hasSelectedAllAttributes ? "Vui lòng chọn đầy đủ tuỳ chọn" : isMutating ? "Đang thêm..." : inStock ? "Thêm vào giỏ" : "Tạm hết hàng"}
							</Button>
						</div>

						<div className='mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-2'>
							<div className='flex items-center gap-3 text-sm text-ink/80'>
								<TruckIcon className='h-5 w-5 text-primary' />
								Miễn phí vận chuyển từ 500.000₫
							</div>
							<div className='flex items-center gap-3 text-sm text-ink/80'>
								<ShieldCheckIcon className='h-5 w-5 text-primary' />
								Bảo hành chính hãng 12 tháng
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='mt-16'>
					<Tabs value={activeTab} onChange={setActiveTab}>
						{tabs.map((tab) => (
							<TabItem key={tab.id} value={tab.id}>
								{tab.label}
							</TabItem>
						))}
					</Tabs>

					<div className='max-w-3xl py-8 text-sm leading-relaxed text-ink/80'>
						{activeTab === "description" && <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>}
						{activeTab === "specs" && (
							<ul className='space-y-2'>
								<li className='flex justify-between border-b border-border py-2'>
									<span className='text-muted'>Danh mục</span>
									<span className='font-medium text-ink'>{product.category?.name ?? "Chưa phân loại"}</span>
								</li>
								<li className='flex justify-between border-b border-border py-2'>
									<span className='text-muted'>Mã SKU</span>
									<span className='font-medium text-ink'>{selectedSku?.sku ?? "—"}</span>
								</li>
								<li className='flex justify-between border-b border-border py-2'>
									<span className='text-muted'>Tình trạng</span>
									<span className='font-medium text-ink'>{isUnavailableCombination ? "Không có sẵn" : inStock ? "Còn hàng" : "Hết hàng"}</span>
								</li>
								<li className='flex justify-between py-2'>
									<span className='text-muted'>Bảo hành</span>
									<span className='font-medium text-ink'>12 tháng chính hãng</span>
								</li>
							</ul>
						)}
						{activeTab === "reviews" &&
							(product.reviews.length > 0 ? (
								<ul className='space-y-6'>
									{product.reviews.map((review) => (
										<li key={review.id} className='border-b border-border pb-6 last:border-0'>
											<div className='flex items-center gap-1 text-primary'>
												{Array.from({ length: 5 }).map((_, i) => (
													<StarIcon key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-primary" : "text-border"}`} />
												))}
											</div>
											<p className='mt-2 font-semibold text-ink'>{review.user?.name ?? "Khách hàng"}</p>
											{review.comment && <p className='mt-1 text-ink/80'>{review.comment}</p>}
										</li>
									))}
								</ul>
							) : (
								<p className='text-muted'>Sản phẩm này chưa có đánh giá nào.</p>
							))}
					</div>
				</div>

				{/* Related products */}
				{related.length > 0 && (
					<div className='mt-16'>
						<h2 className='text-2xl font-extrabold tracking-tight text-ink'>Sản phẩm liên quan</h2>
						<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4'>
							{related.map((p) => (
								<ProductCard key={p.slug} product={toProductCardItem(p)} />
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductDetailPage;
