import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";
import ClaimImageUploadField from "./claim-image-upload-field";
import { useCreateWarrantyClaim } from "../hooks";
import type { WarrantableOrderItem } from "../types";
import { formatDate } from "../../../../utils";

const FALLBACK_IMAGE = "https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=San+pham";

interface WarrantyClaimFormModalProps {
	item: WarrantableOrderItem;
	onClose: () => void;
}

/**
 * Form gửi yêu cầu bảo hành mới cho 1 order item đủ điều kiện (đã lọc sẵn "còn hạn" ở
 * useWarrantableOrderItemsQuery). Nếu item.trackSerial=true, bắt buộc chọn đúng serial trong số
 * (các) đơn vị vật lý thuộc CHÍNH order item này — khớp rule bắt buộc productUnitId ở backend
 * (createWarrantyClaim). Nếu không trackSerial, không hiện field này (và không gửi productUnitId).
 */
const WarrantyClaimFormModal = ({ item, onClose }: WarrantyClaimFormModalProps) => {
	const [issueDescription, setIssueDescription] = useState("");
	const [productUnitId, setProductUnitId] = useState<string>(
		item.productUnits[0] ? String(item.productUnits[0].id) : "",
	);
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [errors, setErrors] = useState<{ issueDescription?: string; productUnitId?: string }>({});

	const createClaim = useCreateWarrantyClaim();

	const validate = () => {
		const nextErrors: { issueDescription?: string; productUnitId?: string } = {};
		if (issueDescription.trim().length < 10) {
			nextErrors.issueDescription = "Mô tả lỗi cần ít nhất 10 ký tự để nhân viên nắm rõ tình trạng sản phẩm.";
		}
		if (item.trackSerial && !productUnitId) {
			nextErrors.productUnitId = "Vui lòng chọn đúng serial của sản phẩm bạn đang gặp lỗi.";
		}
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		createClaim.mutate(
			{
				orderItemId: item.orderItemId,
				issueDescription: issueDescription.trim(),
				imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
				productUnitId: item.trackSerial ? Number(productUnitId) : undefined,
			},
			{ onSuccess: onClose },
		);
	};

	return (
		<ModalShell title='Gửi yêu cầu bảo hành' onClose={onClose} maxWidthClassName='max-w-lg'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='flex items-center gap-3 rounded-xl bg-cream-soft p-3'>
					<img
						src={item.productImage ?? FALLBACK_IMAGE}
						alt={item.product?.name ?? "Sản phẩm"}
						className='h-14 w-14 shrink-0 rounded-lg object-cover'
					/>
					<div>
						<p className='line-clamp-2 text-sm font-semibold text-ink'>{item.product?.name ?? "Sản phẩm"}</p>
						<p className='mt-0.5 text-xs text-muted'>
							Bảo hành tới {formatDate(item.warrantyEndAt)} · {item.warrantyPolicy.name}
						</p>
					</div>
				</div>

				{item.trackSerial && (
					<FormSelect
						label='Serial sản phẩm bạn đang gặp lỗi'
						fullWidth
						value={productUnitId}
						onChange={(e) => setProductUnitId(e.target.value)}
						options={item.productUnits.map((u) => ({ value: String(u.id), label: u.serialNumber }))}
						error={errors.productUnitId}
					/>
				)}

				<FormControl
					as='textarea'
					rows={4}
					label='Mô tả lỗi bạn đang gặp phải'
					value={issueDescription}
					onChange={(e) => setIssueDescription(e.target.value)}
					placeholder='Vd: Màn hình bị sọc dọc khi bật máy...'
					error={errors.issueDescription}
				/>

				<ClaimImageUploadField value={imageUrls} onChange={setImageUrls} />

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={createClaim.isPending}>
						{createClaim.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default WarrantyClaimFormModal;
