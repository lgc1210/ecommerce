import { collectAttributeValues } from "../utils";
import type { PublicProductSku, VariationDetails } from "../types";
import Button from "../../../../components/button";

interface VariationSelectorProps {
	attribute: string;
	skus: PublicProductSku[];
	selected: VariationDetails;
	onSelect: (attribute: string, value: string) => void;
}

/**
 * 1 nhóm lựa chọn biến thể (vd: "color" -> Đen/Trắng). Giá trị nào không còn SKU nào còn hàng
 * (với các lựa chọn khác hiện tại) sẽ bị làm mờ nhưng vẫn bấm chọn được, để khách vẫn xem được ảnh/giá
 * của tổ hợp đó dù tạm hết hàng.
 */
const VariationSelector = ({ attribute, skus, selected, onSelect }: VariationSelectorProps) => {
	const values = collectAttributeValues(skus, attribute);

	const isValueAvailable = (value: string) => {
		const candidate = { ...selected, [attribute]: value };
		const isAvailable = skus.some((sku) => {
			const match = Object.entries(candidate).every(([key, val]) => {
				return sku.variationDetails?.[key] === val;
			});
			return match && sku.stockQuantity > 0;
		});
		return isAvailable;
	};

	return (
		<div>
			<h3 className='text-sm font-semibold text-ink'>
				{attribute}: <span className='font-normal text-muted'>{selected[attribute]}</span>
			</h3>
			<div className='mt-2 flex flex-wrap gap-2'>
				{values.map((value) => {
					const isActive = selected[attribute] === value;
					const available = isValueAvailable(value);
					return (
						<Button type='button' variant={isActive ? "primary" : "outline"} key={value} onClick={() => onSelect(attribute, value)} className={!available ? "opacity-50!" : ""}>
							{value}
						</Button>
					);
				})}
			</div>
		</div>
	);
};

export default VariationSelector;
