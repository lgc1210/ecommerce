import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { PlusIcon, TrashIcon } from "../../../../components/icons";
import type { ProductSku, SkuPayload, VariationDetails } from "../types";

interface SkuFormModalProps {
	sku?: ProductSku;
	onClose: () => void;
	onSubmit: (payload: SkuPayload) => void;
	isSubmitting: boolean;
}

type VariationRow = { key: string; value: string };

type Errors = {
	skuCode?: string;
	price?: string;
	oldPrice?: string;
	stockQuantity?: string;
	variationDetails?: string;
	weightGram?: string;
	lengthCm?: string;
	widthCm?: string;
	heightCm?: string;
};

const DEFAULT_WEIGHT_GRAM = "500";
const DEFAULT_DIMENSION_CM = "20";

const toRows = (details: VariationDetails | undefined): VariationRow[] => {
	const entries = Object.entries(details ?? {});
	return entries.length > 0 ? entries.map(([key, value]) => ({ key, value: String(value) })) : [{ key: "", value: "" }];
};

const SkuFormModal = ({ sku, onClose, onSubmit, isSubmitting }: SkuFormModalProps) => {
	const isEditing = Boolean(sku);

	const [skuCode, setSkuCode] = useState(sku?.sku ?? "");
	const [price, setPrice] = useState(sku ? String(Number(sku.price)) : "");
	const [oldPrice, setOldPrice] = useState(sku?.oldPrice ? String(Number(sku.oldPrice)) : "");
	const [stockQuantity, setStockQuantity] = useState(sku ? String(sku.stockQuantity) : "0");
	const [rows, setRows] = useState<VariationRow[]>(toRows(sku?.variationDetails));
	const [weightGram, setWeightGram] = useState(sku ? String(sku.weightGram) : DEFAULT_WEIGHT_GRAM);
	const [lengthCm, setLengthCm] = useState(sku ? String(sku.lengthCm) : DEFAULT_DIMENSION_CM);
	const [widthCm, setWidthCm] = useState(sku ? String(sku.widthCm) : DEFAULT_DIMENSION_CM);
	const [heightCm, setHeightCm] = useState(sku ? String(sku.heightCm) : DEFAULT_DIMENSION_CM);
	const [errors, setErrors] = useState<Errors>({});

	const addRow = () => {
		setRows((prev) => [...prev, { key: "", value: "" }]);
	};
	const removeRow = (index: number) => {
		setRows((prev) => prev.filter((_, i) => i !== index));
	};
	const updateRow = (index: number, patch: Partial<VariationRow>) => {
		setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	};

	const validate = () => {
		const nextErrors: Errors = {};
		const priceNumber = Number(price);

		if (!price.trim() || priceNumber <= 0) {
			nextErrors.price = "Giá phải lớn hơn 0.";
		}
		if (oldPrice.trim()) {
			const oldPriceNumber = Number(oldPrice);
			if (oldPriceNumber <= 0) {
				nextErrors.oldPrice = "Giá cũ phải lớn hơn 0.";
			} else if (priceNumber > 0 && oldPriceNumber <= priceNumber) {
				nextErrors.oldPrice = "Giá cũ phải lớn hơn giá bán hiện tại.";
			}
		}
		if (stockQuantity.trim() && Number(stockQuantity) < 0) {
			nextErrors.stockQuantity = "Tồn kho không được âm.";
		}
		if (!weightGram.trim() || Number(weightGram) <= 0) {
			nextErrors.weightGram = "Khối lượng phải lớn hơn 0.";
		}
		if (!lengthCm.trim() || Number(lengthCm) <= 0) {
			nextErrors.lengthCm = "Chiều dài phải lớn hơn 0.";
		}
		if (!widthCm.trim() || Number(widthCm) <= 0) {
			nextErrors.widthCm = "Chiều rộng phải lớn hơn 0.";
		}
		if (!heightCm.trim() || Number(heightCm) <= 0) {
			nextErrors.heightCm = "Chiều cao phải lớn hơn 0.";
		}

		const validRows = rows.filter((row) => row.key.trim() && row.value.trim());
		if (validRows.length === 0) {
			nextErrors.variationDetails = "Cần ít nhất 1 thuộc tính biến thể (vd: màu sắc, kích cỡ).";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		const variationDetails: VariationDetails = {};
		for (const row of rows) {
			if (row.key.trim() && row.value.trim()) variationDetails[row.key.trim()] = row.value.trim();
		}

		const payload = {
			...(skuCode.trim() ? { sku: skuCode.trim() } : {}),
			price: Number(price),
			oldPrice: oldPrice.trim() ? Number(oldPrice) : null,
			stockQuantity: stockQuantity.trim() ? Number(stockQuantity) : 0,
			variationDetails,
			weightGram: Number(weightGram),
			lengthCm: Number(lengthCm),
			widthCm: Number(widthCm),
			heightCm: Number(heightCm),
		};

		onSubmit(payload);
	};

	return (
		<ModalShell title={isEditing ? "Sửa biến thể" : "Thêm biến thể"} onClose={onClose} maxWidthClassName='max-w-2xl'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl label='Mã SKU' value={skuCode} onChange={(e) => setSkuCode(e.target.value)} placeholder='Tự sinh từ tên sản phẩm + biến thể nếu để trống' error={errors.skuCode} />

				<div className='grid gap-4 sm:grid-cols-3'>
					<FormControl label='Giá (đ)' type='number' step='any' value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} />
					<FormControl label='Giá cũ (đ)' type='number' step='any' value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder='Để trống nếu không giảm giá' error={errors.oldPrice} />
					<FormControl
						label='Tồn kho'
						type='number'
						step='any'
						value={stockQuantity}
						onChange={(e) => {
							const value = Number(e.target.value);
							setStockQuantity(value < 0 ? "0" : String(value));
						}}
						error={errors.stockQuantity}
					/>
				</div>

				<div>
					<div className='mb-1.5 flex items-center justify-between'>
						<span className='text-sm font-medium text-ink'>Thuộc tính biến thể</span>
						<button type='button' onClick={addRow} className='flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline cursor-pointer'>
							<PlusIcon className='h-3.5 w-3.5' />
							Thêm thuộc tính
						</button>
					</div>

					<div className='space-y-2'>
						{rows.map((row, index) => (
							<div key={index} className='flex items-center gap-2'>
								<FormControl wrapperClassName='flex-1' placeholder='Tên thuộc tính (vd: color)' value={row.key} onChange={(e) => updateRow(index, { key: e.target.value })} />
								<FormControl wrapperClassName='flex-1' placeholder='Giá trị (vd: Đỏ)' value={row.value} onChange={(e) => updateRow(index, { value: e.target.value })} />
								<button
									type='button'
									disabled={rows.length === 1}
									onClick={() => removeRow(index)}
									className='flex h-12 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted cursor-pointer'>
									<TrashIcon className='h-4 w-4' />
								</button>
							</div>
						))}
					</div>
					{errors.variationDetails && <p className='mt-1.5 text-sm text-red-500'>{errors.variationDetails}</p>}
				</div>

				<div>
					<span className='mb-1.5 block text-sm font-medium text-ink'>Khối lượng & kích thước đóng gói</span>
					<p className='mb-2 text-xs text-muted'>Dùng để tính phí vận chuyển GHN thực tế cho biến thể này.</p>

					<div className='grid gap-4 sm:grid-cols-4'>
						<FormControl label='Khối lượng (g)' type='number' step='any' value={weightGram} onChange={(e) => setWeightGram(e.target.value)} error={errors.weightGram} />
						<FormControl label='Dài (cm)' type='number' step='any' value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} error={errors.lengthCm} />
						<FormControl label='Rộng (cm)' type='number' step='any' value={widthCm} onChange={(e) => setWidthCm(e.target.value)} error={errors.widthCm} />
						<FormControl label='Cao (cm)' type='number' step='any' value={heightCm} onChange={(e) => setHeightCm(e.target.value)} error={errors.heightCm} />
					</div>
				</div>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo biến thể"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default SkuFormModal;
