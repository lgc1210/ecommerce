import { useState, type SubmitEvent } from "react";
import type { AddressType, CreateAddressPayload, UserAddress } from "../../types";
import ModalShell from "../../../../../components/modal-shell";
import FormControl from "../../../../../components/form-control";
import FormCheckbox from "../../../../../components/form-checkbox";
import Button from "../../../../../components/button";

const emptyAddressForm: CreateAddressPayload = {
	addressType: "shipping",
	recipientName: "",
	phoneNumber: "",
	addressLine: "",
	ward: "",
	province: "",
	isDefault: false,
};

interface AddressFormModalProps {
	initialValue: UserAddress | null;
	onClose: () => void;
	onSubmit: (payload: CreateAddressPayload) => void;
	isSubmitting: boolean;
}

const AddressFormModal = ({ initialValue, onClose, onSubmit, isSubmitting }: AddressFormModalProps) => {
	const [form, setForm] = useState<CreateAddressPayload>(
		initialValue
			? {
					addressType: initialValue.addressType,
					recipientName: initialValue.recipientName,
					phoneNumber: initialValue.phoneNumber,
					addressLine: initialValue.addressLine,
					ward: initialValue.ward,
					province: initialValue.province,
					isDefault: initialValue.isDefault,
				}
			: emptyAddressForm,
	);

	const isValid =
		form.recipientName.trim() &&
		form.phoneNumber.trim() &&
		form.addressLine.trim() &&
		form.ward.trim() &&
		form.province.trim();

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isValid) return;
		onSubmit(form);
	};

	const updateField = <K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<ModalShell title={initialValue ? "Sửa địa chỉ" : "Thêm địa chỉ mới"} onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='flex gap-2'>
					{(["shipping", "billing"] as AddressType[]).map((type) => (
						<button
							key={type}
							type='button'
							onClick={() => updateField("addressType", type)}
							className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
								form.addressType === type
									? "border-primary bg-primary-light text-primary-dark"
									: "border-border text-ink hover:bg-cream-soft"
							}`}>
							{type === "shipping" ? "Giao hàng" : "Thanh toán"}
						</button>
					))}
				</div>

				<FormControl
					label='Tên người nhận'
					required
					value={form.recipientName}
					onChange={(e) => updateField("recipientName", e.target.value)}
				/>
				<FormControl
					label='Số điện thoại'
					required
					value={form.phoneNumber}
					onChange={(e) => updateField("phoneNumber", e.target.value)}
					placeholder='0912345678'
				/>
				<FormControl
					label='Địa chỉ cụ thể'
					required
					value={form.addressLine}
					onChange={(e) => updateField("addressLine", e.target.value)}
					placeholder='Số nhà, tên đường...'
				/>
				<div className='grid grid-cols-2 gap-3'>
					<FormControl
						label='Phường/Xã'
						required
						value={form.ward}
						onChange={(e) => updateField("ward", e.target.value)}
					/>
					<FormControl
						label='Tỉnh/Thành phố'
						required
						value={form.province}
						onChange={(e) => updateField("province", e.target.value)}
					/>
				</div>

				{!initialValue?.isDefault && (
					<FormCheckbox
						label='Đặt làm địa chỉ mặc định'
						checked={form.isDefault}
						onChange={(e) => updateField("isDefault", e.target.checked)}
					/>
				)}

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={!isValid || isSubmitting}>
						{isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default AddressFormModal;
