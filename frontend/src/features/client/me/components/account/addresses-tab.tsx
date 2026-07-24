import { useState } from "react";
import Button from "../../../../../components/button";
import Popup from "../../../../../components/popup";
import {
	useCreateAddress,
	useDeleteAddress,
	useMyAddressesQuery,
	useSetDefaultAddress,
	useUpdateAddress,
} from "../../hooks";
import type { UserAddress } from "../../types";
import { PlusIcon } from "../../../../../components/icons";
import AddressFormModal from "./address-form";
import AddressesTabItem from "./addesses-tab-item";

const AddressesTab = () => {
	const { data: addresses = [], isLoading } = useMyAddressesQuery();
	const createAddress = useCreateAddress();
	const updateAddress = useUpdateAddress();
	const setDefaultAddress = useSetDefaultAddress();
	const deleteAddress = useDeleteAddress();

	const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(null);

	const openCreateForm = () => {
		setEditingAddress(null);
		setFormOpen(true);
	};

	const openEditForm = (address: UserAddress) => {
		setEditingAddress(address);
		setFormOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!deletingAddress) return;
		deleteAddress.mutate(deletingAddress.id, { onSuccess: () => setDeletingAddress(null) });
	};

	return (
		<div>
			<div className='mb-4 flex items-center justify-between'>
				<p className='text-sm text-muted'>{addresses.length} địa chỉ đã lưu</p>
				<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={openCreateForm}>
					Thêm địa chỉ
				</Button>
			</div>

			{isLoading ? (
				<p className='py-8 text-center text-sm text-muted'>Đang tải...</p>
			) : addresses.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted'>
					Bạn chưa có địa chỉ nào. Thêm địa chỉ để đặt hàng nhanh hơn.
				</div>
			) : (
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					{addresses.map((address) => (
						<AddressesTabItem
							key={address.id}
							address={address}
							onEdit={openEditForm}
							onDelete={setDeletingAddress}
							onSetDefault={(addressId) => setDefaultAddress.mutate(addressId)}
							isSettingDefault={setDefaultAddress.isPending}
							isDeleting={deleteAddress.isPending}
						/>
					))}
				</div>
			)}

			{formOpen && (
				<AddressFormModal
					initialValue={editingAddress}
					onClose={() => setFormOpen(false)}
					isSubmitting={createAddress.isPending || updateAddress.isPending}
					onSubmit={(payload) => {
						if (editingAddress) {
							updateAddress.mutate(
								{ addressId: editingAddress.id, ...payload },
								{ onSuccess: () => setFormOpen(false) },
							);
						} else {
							createAddress.mutate(payload, { onSuccess: () => setFormOpen(false) });
						}
					}}
				/>
			)}

			{deletingAddress && (
				<Popup
					title='Xóa địa chỉ'
					description={`Bạn có chắc muốn xóa địa chỉ "${deletingAddress.addressLine}"? Hành động này không thể hoàn tác.`}
					variant='danger'
					confirmLabel='Xóa địa chỉ'
					isConfirming={deleteAddress.isPending}
					onConfirm={handleConfirmDelete}
					onClose={() => setDeletingAddress(null)}
				/>
			)}
		</div>
	);
};

export default AddressesTab;
