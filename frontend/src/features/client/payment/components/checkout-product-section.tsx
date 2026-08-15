import { formatCurrency } from "../../../../utils/currency";
import { formatVariationDetails } from "../../product/utils";
import type { CartLineView } from "../../cart/types";
import { computeTotalQuantity } from "../../cart/utils";

interface CheckoutProductSectionProps {
	items: CartLineView[];
}

/**
 * Danh sách sản phẩm trong đơn hàng đang thanh toán — lấy từ giỏ hàng thật (`useCart()`,
 * cùng nguồn dữ liệu với trang Giỏ hàng). Chỉ hiển thị, không cho sửa số lượng/xóa ở đây —
 * muốn thay đổi giỏ hàng thì quay lại trang Giỏ hàng.
 */
const CheckoutProductSection = ({ items }: CheckoutProductSectionProps) => {
	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<div className='flex items-center justify-start gap-2 mb-5'>
				<h2 className='text-lg font-bold text-ink'>Sản phẩm</h2>
				<p className='text-sm text-muted'>({computeTotalQuantity(items)})</p>
			</div>

			<div className='space-y-5'>
				{items.map((item) => {
					const variationLabel = formatVariationDetails(item.variationDetails);
					return (
						<div key={item.id} className='flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0'>
							<div className='h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border'>
								<img src={item.image} alt={item.productName} className='h-full w-full object-cover' />
							</div>
							<div className='flex-1'>
								<div className='line-clamp-2 font-semibold text-ink'>{item.productName}</div>
								{variationLabel && <p className='mt-1 text-sm text-muted'>{variationLabel}</p>}
								{!item.inStock && <p className='mt-1 text-xs font-semibold text-red-600'>Sản phẩm đã hết hàng hoặc ngừng kinh doanh</p>}
								<div className='mt-3 flex items-center justify-between'>
									<span className='text-sm text-muted'>SL: {item.quantity}</span>
									<span className='font-bold text-primary'>{formatCurrency(item.price * item.quantity)}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default CheckoutProductSection;
