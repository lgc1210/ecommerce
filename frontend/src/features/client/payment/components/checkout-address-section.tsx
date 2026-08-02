import { useEffect, useState } from "react";
import { ShieldIcon, PlusIcon } from "../../../../components/icons";
import Button from "../../../../components/button";
import { useCreateAddress, useMyAddressesQuery } from "../../me/hooks";
import type { CreateAddressPayload, UserAddress } from "../../me/types";
import AddressFormModal from "../../me/components/account/address-form";
import AddressPickerModal from "./address-picker-modal";

interface CheckoutAddressSectionProps {
	selectedAddressId: number | null;
	onSelectAddress: (address: UserAddress) => void;
}

/**
 * Địa chỉ nhận hàng ở trang thanh toán. Lấy dữ liệu thật từ sổ địa chỉ của
 * chính user (GET /users/me/addresses), tự chọn địa chỉ mặc định khi mới vào
 * trang, cho phép đổi sang địa chỉ khác đã lưu hoặc thêm địa chỉ mới ngay tại
 * đây (dùng chung service/hook và form với trang Tài khoản).
 */
const CheckoutAddressSection = ({ selectedAddressId, onSelectAddress }: CheckoutAddressSectionProps) => {
	const { data: addresses = [], isLoading } = useMyAddressesQuery();
	const createAddress = useCreateAddress();

	const [pickerOpen, setPickerOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);

	// Chưa có địa chỉ nào được chọn nhưng đã tải xong sổ địa chỉ -> tự chọn địa chỉ mặc định
	// (hoặc địa chỉ đầu tiên nếu không có mặc định) để người dùng không phải tự bấm chọn.
	useEffect(() => {
		if (selectedAddressId || addresses.length === 0) return;
		const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]!;
		onSelectAddress(defaultAddress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addresses, selectedAddressId]);

	const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

	const handleCreateAddress = (payload: CreateAddressPayload) => {
		createAddress.mutate(payload, {
			onSuccess: (res) => {
				setFormOpen(false);
				const created = res.data.data as UserAddress;
				onSelectAddress(created);
			},
		});
	};

	return (
		<section className='rounded-3xl border border-border bg-white p-6'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<ShieldIcon className='h-5 w-5 text-primary' />
					<h2 className='text-lg font-bold text-ink'>Địa chỉ nhận hàng</h2>
				</div>

				{addresses.length > 0 && (
					<button
						type='button'
						onClick={() => setPickerOpen(true)}
						className='cursor-pointer text-sm font-semibold text-primary hover:underline'>
						Thay đổi
					</button>
				)}
			</div>

			{isLoading ? (
				<p className='text-sm text-muted'>Đang tải địa chỉ...</p>
			) : selectedAddress ? (
				<div className='rounded-2xl bg-cream-soft p-4'>
					<p className='font-semibold text-ink'>{selectedAddress.recipientName}</p>
					<p className='mt-1 text-sm text-muted'>{selectedAddress.phoneNumber}</p>
					<p className='mt-2 text-sm text-muted'>
						{selectedAddress.addressLine}, {selectedAddress.wardName}, {selectedAddress.districtName},{" "}
						{selectedAddress.provinceName}
					</p>
				</div>
			) : (
				<div className='rounded-2xl border border-dashed border-border p-4 text-center'>
					<p className='text-sm text-muted'>Bạn chưa có địa chỉ nhận hàng nào.</p>
					<Button
						type='button'
						size='sm'
						className='mt-3'
						icon={<PlusIcon className='h-4 w-4' />}
						iconPosition='left'
						onClick={() => setFormOpen(true)}>
						Thêm địa chỉ
					</Button>
				</div>
			)}

			{pickerOpen && (
				<AddressPickerModal
					addresses={addresses}
					selectedAddressId={selectedAddressId}
					onClose={() => setPickerOpen(false)}
					onSelect={(address) => {
						onSelectAddress(address);
						setPickerOpen(false);
					}}
					onAddNew={() => {
						setPickerOpen(false);
						setFormOpen(true);
					}}
				/>
			)}

			{formOpen && (
				<AddressFormModal
					initialValue={null}
					onClose={() => setFormOpen(false)}
					isSubmitting={createAddress.isPending}
					onSubmit={handleCreateAddress}
				/>
			)}
		</section>
	);
};

export default CheckoutAddressSection;
