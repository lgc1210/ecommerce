import { useMemo, useState, type ChangeEvent, type SubmitEvent } from "react";
import type { AddressTag, CreateAddressPayload, UserAddress } from "../../types";
import ModalShell from "../../../../../components/modal-shell";
import FormControl from "../../../../../components/form-control";
import FormSelect, { type FormSelectOption } from "../../../../../components/form-select";
import FormCheckbox from "../../../../../components/form-checkbox";
import Button from "../../../../../components/button";
import { useDistrictsQuery, useProvincesQuery, useWardsQuery } from "../../../../external/location/hooks";

const emptyAddressForm: CreateAddressPayload = {
	tag: "home",
	recipientName: "",
	phoneNumber: "",
	addressLine: "",
	wardName: "",
	districtName: "",
	provinceName: "",
	provinceId: 0,
	districtId: 0,
	wardCode: "",
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
					tag: initialValue.tag,
					recipientName: initialValue.recipientName,
					phoneNumber: initialValue.phoneNumber,
					addressLine: initialValue.addressLine,
					wardName: initialValue.wardName,
					districtName: initialValue.districtName,
					provinceName: initialValue.provinceName,
					provinceId: initialValue.provinceId,
					districtId: initialValue.districtId,
					wardCode: initialValue.wardCode,
					isDefault: initialValue.isDefault,
				}
			: emptyAddressForm,
	);

	// Tra cứu Tỉnh/Thành - Quận/Huyện - Phường/Xã (GHN, qua backend `external/ghn`).
	// Quận/Huyện và Phường/Xã phụ thuộc lựa chọn cấp cha nên chỉ fetch khi đã có provinceId/districtId
	// tương ứng — khi sửa 1 địa chỉ có sẵn, provinceId/districtId lấy từ form ban đầu nên 2 danh sách
	// con cũng tự fetch ngay để hiển thị đúng lựa chọn hiện tại.
	const { data: provinces = [], isLoading: isLoadingProvinces } = useProvincesQuery();
	const { data: districts = [], isLoading: isLoadingDistricts } = useDistrictsQuery(form.provinceId || undefined);
	const { data: wards = [], isLoading: isLoadingWards } = useWardsQuery(form.districtId || undefined);

	const provinceOptions: FormSelectOption[] = useMemo(() => provinces.map((province) => ({ value: province.ProvinceID, label: province.ProvinceName })), [provinces]);
	const districtOptions: FormSelectOption[] = useMemo(() => districts.map((district) => ({ value: district.DistrictID, label: district.DistrictName })), [districts]);
	const wardOptions: FormSelectOption[] = useMemo(() => wards.map((ward) => ({ value: ward.WardCode, label: ward.WardName })), [wards]);

	const isValid = form.recipientName.trim() && form.phoneNumber.trim() && form.addressLine.trim() && form.provinceId > 0 && form.districtId > 0 && form.wardCode.trim();

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isValid) return;
		onSubmit(form);
	};

	const updateField = <K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	// Chọn Tỉnh/Thành phố -> reset Quận/Huyện + Phường/Xã đang chọn (đổi cấp cha thì các cấp con không còn hợp lệ).
	// Danh sách Quận/Huyện tương ứng sẽ tự fetch lại (useDistrictsQuery phụ thuộc form.provinceId).
	const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const provinceId = Number(e.target.value);
		const provinceName = provinceOptions.find((option) => option.value === provinceId)?.label ?? "";
		setForm((prev) => ({
			...prev,
			provinceId,
			provinceName,
			districtId: 0,
			districtName: "",
			wardCode: "",
			wardName: "",
		}));
	};

	// Chọn Quận/Huyện -> reset Phường/Xã đang chọn. Danh sách Phường/Xã tự fetch lại tương tự.
	const handleDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const districtId = Number(e.target.value);
		const districtName = districtOptions.find((option) => option.value === districtId)?.label ?? "";
		setForm((prev) => ({ ...prev, districtId, districtName, wardCode: "", wardName: "" }));
	};

	const handleWardChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const wardCode = e.target.value;
		const wardName = wardOptions.find((option) => option.value === wardCode)?.label ?? "";
		updateField("wardCode", wardCode);
		updateField("wardName", wardName);
	};

	return (
		<ModalShell title={initialValue ? "Sửa địa chỉ" : "Thêm địa chỉ mới"} onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div className='flex gap-2'>
					{(["home", "office"] as AddressTag[]).map((tag) => (
						<button
							key={tag}
							type='button'
							onClick={() => updateField("tag", tag)}
							className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
								form.tag === tag ? "border-primary bg-primary-light text-primary-dark" : "border-border text-ink hover:bg-cream-soft"
							}`}>
							{tag === "home" ? "Nhà riêng" : "Văn phòng"}
						</button>
					))}
				</div>
				<FormControl label='Tên người nhận' required value={form.recipientName} onChange={(e) => updateField("recipientName", e.target.value)} />
				<FormControl label='Số điện thoại' required value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} placeholder='0912345678' />
				<FormControl label='Địa chỉ cụ thể' required value={form.addressLine} onChange={(e) => updateField("addressLine", e.target.value)} placeholder='Số nhà, tên đường...' />
				<FormSelect
					label='Tỉnh/Thành phố'
					required
					fullWidth
					value={form.provinceId || ""}
					onChange={handleProvinceChange}
					options={provinceOptions}
					placeholder={isLoadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
					disabled={isLoadingProvinces}
				/>
				<FormSelect
					label='Quận/Huyện'
					required
					fullWidth
					value={form.districtId || ""}
					onChange={handleDistrictChange}
					options={districtOptions}
					placeholder={isLoadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}
					disabled={!form.provinceId || isLoadingDistricts}
				/>
				<FormSelect
					label='Phường/Xã'
					required
					fullWidth
					value={form.wardCode}
					onChange={handleWardChange}
					options={wardOptions}
					placeholder={isLoadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
					disabled={!form.districtId || isLoadingWards}
				/>

				{!initialValue?.isDefault && <FormCheckbox label='Đặt làm địa chỉ mặc định' checked={form.isDefault} onChange={(e) => updateField("isDefault", e.target.checked)} />}

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
