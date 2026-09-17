import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import Button from "../../../../components/button";
import { useReceiveStock } from "../hooks";
import type { ProductSku } from "../types";

interface ReceiveStockModalProps {
	productId: number;
	sku: ProductSku;
	onClose: () => void;
}

/**
 * Nhập kho theo serial — CHỈ dùng cho SKU có trackSerial=true. Mỗi dòng textarea = 1 serial,
 * khớp đúng cách backend nhận `serialNumbers: string[]` (receiveSerializedStock, tạo N dòng
 * ProductUnit + cộng dồn stockQuantity trong 1 transaction).
 */
const ReceiveStockModal = ({ productId, sku, onClose }: ReceiveStockModalProps) => {
	const [rawInput, setRawInput] = useState("");
	const [error, setError] = useState<string | undefined>();
	const receiveStock = useReceiveStock();

	const parseSerials = (): string[] => {
		const lines = rawInput
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
		return Array.from(new Set(lines));
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const serialNumbers = parseSerials();

		if (serialNumbers.length === 0) {
			setError("Cần nhập ít nhất 1 số serial.");
			return;
		}
		if (serialNumbers.length > 500) {
			setError("Mỗi lần nhập kho tối đa 500 serial, vui lòng chia nhỏ.");
			return;
		}
		setError(undefined);

		receiveStock.mutate({ productId, skuId: sku.id, serialNumbers }, { onSuccess: onClose });
	};

	const previewCount = parseSerials().length;

	return (
		<ModalShell title={`Nhập kho theo serial — ${sku.sku}`} onClose={onClose} maxWidthClassName='max-w-lg'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<p className='text-sm text-muted'>
					Đang có <span className='font-semibold text-ink'>{sku.stockQuantity}</span> đơn vị trong kho. Nhập mỗi serial
					1 dòng — hệ thống sẽ tự kiểm tra trùng và báo lỗi nếu serial nào đã tồn tại.
				</p>

				<FormControl
					as='textarea'
					rows={8}
					label={`Danh sách serial${previewCount > 0 ? ` (${previewCount})` : ""}`}
					value={rawInput}
					onChange={(e) => setRawInput(e.target.value)}
					placeholder={"IMEI001\nIMEI002\nIMEI003"}
					error={error}
				/>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={receiveStock.isPending}>
						{receiveStock.isPending
							? "Đang nhập kho..."
							: `Nhập kho${previewCount > 0 ? ` ${previewCount} serial` : ""}`}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default ReceiveStockModal;
