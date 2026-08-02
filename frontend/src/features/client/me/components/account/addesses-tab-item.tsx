import Button from "../../../../../components/button";
import { PhoneIcon, StarIcon, TrashIcon } from "../../../../../components/icons";
import type { UserAddress } from "../../types";

interface Props {
	address: UserAddress;
	onEdit: (address: UserAddress) => void;
	onDelete: (address: UserAddress) => void;
	onSetDefault: (addressId: number) => void;
	isSettingDefault: boolean;
	isDeleting: boolean;
}

const AddressesTabItem = ({ address, onEdit, onDelete, onSetDefault, isSettingDefault, isDeleting }: Props) => {
	return (
		<div className='flex flex-col relative rounded-2xl border border-border bg-surface p-4'>
			{address.isDefault && (
				<span className='absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark'>
					<StarIcon className='h-3 w-3' />
					Mặc định
				</span>
			)}

			<p className='pr-24 font-semibold text-ink'>{address.recipientName}</p>
			<p className='mt-1 flex items-center gap-1.5 text-sm text-muted'>
				<PhoneIcon className='h-3.5 w-3.5' />
				{address.phoneNumber}
			</p>
			<p className='mt-2 text-sm text-ink/80'>
				{address.addressLine}, {address.wardName}, {address.districtName}, {address.provinceName}
			</p>
			<p className='mt-1 text-xs capitalize text-primary-dark'>{address.tag === "home" ? "Nhà riêng" : "Văn phòng"}</p>

			<div className='flex-1 mt-4 flex items-end flex-wrap gap-2'>
				<Button type='button' size='sm' variant='outline' onClick={() => onEdit(address)} className='text-xs'>
					Sửa
				</Button>
				{!address.isDefault && (
					<Button
						type='button'
						size='sm'
						variant='outline'
						disabled={isSettingDefault}
						onClick={() => onSetDefault(address.id)}
						className='text-xs'>
						Đặt làm mặc định
					</Button>
				)}
				<Button
					type='button'
					variant='outline'
					size='sm'
					disabled={isDeleting}
					onClick={() => onDelete(address)}
					araia-label='Xóa địa chỉ'
					className='ml-auto flex items-center justify-center group hover:bg-red-50! px-2.5!'>
					<TrashIcon className='h-4 w-4 text-muted! group-hover:text-red-600! transition-colors' />
				</Button>
			</div>
		</div>
	);
};

export default AddressesTabItem;
