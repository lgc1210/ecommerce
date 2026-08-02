import ModalShell from "../../../../components/modal-shell";
import Button from "../../../../components/button";
import { CheckIcon, PlusIcon } from "../../../../components/icons";
import type { UserAddress } from "../../me/types";

interface AddressPickerModalProps {
	addresses: UserAddress[];
	selectedAddressId: number | null;
	onClose: () => void;
	onSelect: (address: UserAddress) => void;
	onAddNew: () => void;
}

/** Modal chọn 1 địa chỉ trong sổ địa chỉ của chính user để dùng cho đơn hàng đang thanh toán. */
const AddressPickerModal = ({ addresses, selectedAddressId, onClose, onSelect, onAddNew }: AddressPickerModalProps) => {
	return (
		<ModalShell title='Chọn địa chỉ nhận hàng' onClose={onClose} maxWidthClassName='max-w-lg'>
			<div className='max-h-[60vh] space-y-3 overflow-y-auto pr-1'>
				{addresses.map((address) => {
					const isSelected = address.id === selectedAddressId;

					return (
						<button
							key={address.id}
							type='button'
							onClick={() => onSelect(address)}
							className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
								isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
							}`}>
							<div className='flex items-start justify-between gap-3'>
								<div>
									<div className='flex flex-wrap items-center gap-2'>
										<p className='font-semibold text-ink'>{address.recipientName}</p>
										{address.isDefault && (
											<span className='rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary-dark'>
												Mặc định
											</span>
										)}
									</div>
									<p className='mt-1 text-sm text-muted'>{address.phoneNumber}</p>
									<p className='mt-1 text-sm text-ink/80'>
										{address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}
									</p>
								</div>

								{isSelected && <CheckIcon className='h-5 w-5 shrink-0 text-primary' />}
							</div>
						</button>
					);
				})}
			</div>

			<Button
				type='button'
				variant='outline'
				fullWidth
				size='sm'
				className='mt-4'
				icon={<PlusIcon className='h-4 w-4' />}
				iconPosition='left'
				onClick={onAddNew}>
				Thêm địa chỉ mới
			</Button>
		</ModalShell>
	);
};

export default AddressPickerModal;
