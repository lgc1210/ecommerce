import { useState } from "react";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { PencilIcon, TrashIcon } from "../../../../components/icons";
import { formatCurrency } from "../../../../utils/currency";
import { useUpdateSkuStock } from "../hooks";
import { formatVariationDetails } from "../utils";
import type { ProductSku } from "../types";
import SkuImageManager from "./sku-image-manager";

interface SkuCardProps {
	productId: number;
	sku: ProductSku;
	canWriteCatalog: boolean;
	canUpdateInventory: boolean;
	onEdit: () => void;
	onDelete: () => void;
}

/** 1 thẻ biến thể (SKU): thông tin + sửa tồn kho nhanh + quản lý ảnh riêng của SKU đó. */
const SkuCard = ({ productId, sku, canWriteCatalog, canUpdateInventory, onEdit, onDelete }: SkuCardProps) => {
	const [stockInput, setStockInput] = useState(String(sku.stockQuantity));
	const updateStock = useUpdateSkuStock();

	const hasStockChanged =
		Number(stockInput) !== sku.stockQuantity && stockInput.trim() !== "" && Number(stockInput) >= 0;

	const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value);
		setStockInput(value < 0 ? "0" : String(value));
	};

	return (
		<div className='rounded-2xl border border-border bg-surface p-5'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<p className='font-semibold text-ink'>{formatVariationDetails(sku.variationDetails)}</p>
					<p className='mt-0.5 font-mono text-xs text-muted'>{sku.sku}</p>
					<p className='mt-1 text-sm text-ink/80'>{formatCurrency(Number(sku.price))}</p>
				</div>

				{canWriteCatalog && (
					<div className='flex items-center gap-1.5'>
						<button
							type='button'
							onClick={onEdit}
							className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-cream-soft hover:text-ink'
							title='Sửa'>
							<PencilIcon className='h-4 w-4' />
						</button>
						<button
							type='button'
							onClick={onDelete}
							className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600'
							title='Xóa'>
							<TrashIcon className='h-4 w-4' />
						</button>
					</div>
				)}
			</div>

			{canUpdateInventory && (
				<div className='mt-3 flex items-end gap-2'>
					<FormControl
						label='Tồn kho'
						type='number'
						step='any'
						wrapperClassName='w-32'
						value={stockInput}
						onChange={handleStockChange}
					/>
					<Button
						size='sm'
						variant='outline'
						type='button'
						disabled={!hasStockChanged || updateStock.isPending}
						onClick={() => updateStock.mutate({ productId, skuId: sku.id, stockQuantity: Number(stockInput) })}>
						{updateStock.isPending ? "Đang lưu..." : "Cập nhật tồn kho"}
					</Button>
				</div>
			)}

			<div className='mt-4 border-t border-border pt-4'>
				<p className='mb-2 text-sm font-medium text-ink'>Hình ảnh</p>
				{canWriteCatalog ? (
					<SkuImageManager productId={productId} skuId={sku.id} images={sku.images} />
				) : sku.images.length === 0 ? (
					<p className='text-sm text-muted'>Chưa có ảnh.</p>
				) : (
					<div className='flex flex-wrap gap-3'>
						{sku.images.map((image) => (
							<img
								key={image.id}
								src={image.imageUrl}
								alt={image.altText ?? ""}
								className='h-20 w-20 rounded-xl border border-border object-cover'
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default SkuCard;
