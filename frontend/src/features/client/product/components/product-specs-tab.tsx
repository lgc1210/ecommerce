interface Props {
	categoryName: string | undefined;
	sku: string | undefined;
	inStock: boolean;
	isUnavailableCombination: boolean;
}
const ProductSpecsTab = ({ categoryName, sku, inStock, isUnavailableCombination }: Props) => {
	return (
		<ul className='space-y-2'>
			<li className='flex justify-between border-b border-border py-2'>
				<span className='text-muted'>Danh mục</span>
				<span className='font-medium text-ink'>{categoryName ?? "Chưa phân loại"}</span>
			</li>
			<li className='flex justify-between border-b border-border py-2'>
				<span className='text-muted'>Mã SKU</span>
				<span className='font-medium text-ink'>{sku ?? "—"}</span>
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
	);
};

export default ProductSpecsTab;
