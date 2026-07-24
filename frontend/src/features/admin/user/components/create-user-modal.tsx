/**
 * Tạo tài khoản trực tiếp cho nhân viên (khác với luồng /register công khai dành
 * cho khách hàng). Backend không đặt mật khẩu ở đây — sau khi tạo, hệ thống tự gửi
 * email OTP "quên mật khẩu" để người này tự đặt mật khẩu lần đầu, nên form KHÔNG có
 * ô mật khẩu.
 */

import { useState, type SubmitEvent } from "react";
import type { CreateUserPayload } from "../types";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";

interface CreateUserModalProps {
	roles: { id: number; name: string }[];
	onClose: () => void;
	onSubmit: (payload: CreateUserPayload) => void;
	isSubmitting: boolean;
}

const CreateUserModal = ({ roles, onClose, onSubmit, isSubmitting }: CreateUserModalProps) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [roleId, setRoleId] = useState<number | "">(roles[0]?.id ?? "");

	const isValid = name.trim() && email.trim() && phone.trim() && roleId !== "";

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isValid) return;
		onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), roleId: Number(roleId) });
	};

	return (
		<ModalShell title='Tạo tài khoản mới' onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl label='Họ và tên' required value={name} onChange={(e) => setName(e.target.value)} />
				<FormControl label='Email' type='email' required value={email} onChange={(e) => setEmail(e.target.value)} />
				<FormControl
					label='Số điện thoại'
					required
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder='0912345678'
				/>
				<FormSelect
					label='Role'
					required
					fullWidth
					value={roleId}
					onChange={(e) => setRoleId(Number(e.target.value))}
					options={roles.map((role) => ({ value: role.id, label: role.name }))}
					className='capitalize'
					hint='Người dùng sẽ nhận email hướng dẫn đặt mật khẩu lần đầu, không cần nhập mật khẩu ở đây.'
				/>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={!isValid || isSubmitting}>
						{isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default CreateUserModal;
