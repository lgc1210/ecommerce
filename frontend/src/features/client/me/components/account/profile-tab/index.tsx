import { useState, type SubmitEvent } from "react";
import Button from "../../../../../../components/button";
import FormControl from "../../../../../../components/form-control";
import { useAuth } from "../../../../../auth/hooks/useAuth";
import { useUpdateProfile } from "../../../hooks";

/** Form cập nhật tên/SĐT. Email không cho sửa (không có route backend hỗ trợ đổi email). */
const ProfileTab = () => {
	const { user } = useAuth();
	const updateProfile = useUpdateProfile();

	const [name, setName] = useState(user?.name ?? "");
	const [phone, setPhone] = useState(user?.phone ?? "");

	const isUnchanged = name.trim() === (user?.name ?? "") && phone.trim() === (user?.phone ?? "");

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isUnchanged) return;

		const payload: { name?: string; phone?: string } = {};
		if (name.trim() !== user?.name) payload.name = name.trim();
		if (phone.trim() !== user?.phone) payload.phone = phone.trim();

		updateProfile.mutate(payload);
	};

	return (
		<form onSubmit={handleSubmit} className='max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6'>
			<FormControl label='Email' value={user?.email ?? ""} disabled hint='Không thể thay đổi email tài khoản.' />
			<FormControl label='Họ và tên' required value={name} onChange={(e) => setName(e.target.value)} />
			<FormControl label='Số điện thoại' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='0912345678' />
			<Button type='submit' disabled={isUnchanged || updateProfile.isPending}>
				{updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
			</Button>
		</form>
	);
};

export default ProfileTab;
