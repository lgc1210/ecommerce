import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { PlusIcon, TrashIcon } from "../../../../components/icons";
import type { ProductSku, SkuPayload, VariationDetails } from "../types";

interface SkuFormModalProps {
	/** Có giá trị -> đang sửa SKU này. Không có -> đang tạo mới. */
	sku?: ProductSku;
	onClose: () => void;
	onSubmit: (payload: SkuPayload) => void;
	isSubmitting: boolean;
}

type VariationRow = { key: string; value: string };
type Errors = { skuCode?: string; price?: string; stockQuantity?: string; variationDetails?: string };

const toRows = (details: VariationDetails | undefined): VariationRow[] => {
	const entries = Object.entries(details ?? {});
	return entries.length > 0 ? entries.map(([key, value]) => ({ key, value: String(value) })) : [{ key: "", value: "" }];
};

/**
 * Form dùng chung cho tạo mới lẫn sửa 1 biến thể (SKU). "variationDetails" là
 * Json tự do ở backend (vd: {color, size}) nên UI quản lý dưới dạng danh sách
 * cặp key-value có thể thêm/bớt, thay vì cố định sẵn các trường màu/size.
 */
const SkuFormModal = ({ sku, onClose, onSubmit, isSubmitting }: SkuFormModalProps) => {
	const isEditing = Boolean(sku);

	const [skuCode, setSkuCode] = useState(sku?.sku ?? "");
	const [price, setPrice] = useState(sku ? String(Number(sku.price)) : "");
	const [stockQuantity, setStockQuantity] = useState(sku ? String(sku.stockQuantity) : "0");
	const [rows, setRows] = useState<VariationRow[]>(toRows(sku?.variationDetails));
	const [errors, setErrors] = useState<Errors>({});

	const updateRow = (index: number, patch: Partial<VariationRow>) => {
		setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	};

	const addRow = () => setRows((prev) => [...prev, { key: "", value: "" }]);
	const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

	const validate = () => {
		const nextErrors: Errors = {};
		const priceNumber = Number(price);

		if (!price.trim() || priceNumber <= 0) {
			nextErrors.price = "Giá phải lớn hơn 0.";
		}
		if (stockQuantity.trim() && Number(stockQuantity) < 0) {
			nextErrors.stockQuantity = "Tồn kho không được âm.";
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

		onSubmit({
			...(skuCode.trim() ? { sku: skuCode.trim() } : {}),
			price: Number(price),
			stockQuantity: stockQuantity.trim() ? Number(stockQuantity) : 0,
			variationDetails,
		});
	};

	return (
		<ModalShell title={isEditing ? "Sửa biến thể" : "Thêm biến thể"} onClose={onClose} maxWidthClassName='max-w-2xl'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Mã SKU'
					value={skuCode}
					onChange={(e) => setSkuCode(e.target.value)}
					placeholder='Tự sinh từ tên sản phẩm + biến thể nếu để trống'
					error={errors.skuCode}
				/>

				<div className='grid gap-4 sm:grid-cols-2'>
					<FormControl
						label='Giá (đ)'
						type='number'
						step='any'
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						error={errors.price}
					/>
					<FormControl
						label='Tồn kho'
						type='number'
						step='any'
						value={stockQuantity}
						onChange={(e) => setStockQuantity(e.target.value)}
						error={errors.stockQuantity}
					/>
				</div>

				<div>
					<div className='mb-1.5 flex items-center justify-between'>
						<span className='text-sm font-medium text-ink'>Thuộc tính biến thể</span>
						<button
							type='button'
							onClick={addRow}
							className='flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline cursor-pointer'>
							<PlusIcon className='h-3.5 w-3.5' />
							Thêm thuộc tính
						</button>
					</div>

					<div className='space-y-2'>
						{rows.map((row, index) => (
							<div key={index} className='flex items-center gap-2'>
								<FormControl
									wrapperClassName='flex-1'
									placeholder='Tên thuộc tính (vd: color)'
									value={row.key}
									onChange={(e) => updateRow(index, { key: e.target.value })}
								/>
								<FormControl
									wrapperClassName='flex-1'
									placeholder='Giá trị (vd: Đỏ)'
									value={row.value}
									onChange={(e) => updateRow(index, { value: e.target.value })}
								/>
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
