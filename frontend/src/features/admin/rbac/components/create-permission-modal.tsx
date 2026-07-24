import { useState, type SubmitEvent } from "react";
import FormControl from "../../../../components/form-control";
import type { CreatePermissionPayload } from "../types";
import Button from "../../../../components/button";
import ModalShell from "../../../../components/modal-shell";

interface CreatePermissionModalProps {
	onClose: () => void;
	onSubmit: (payload: CreatePermissionPayload) => void;
	isSubmitting: boolean;
}

const CreatePermissionModal = ({ onClose, onSubmit, isSubmitting }: CreatePermissionModalProps) => {
	const [resource, setResource] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!resource.trim() || !name.trim()) return;
		onSubmit({ resource: resource.trim(), name: name.trim(), description: description.trim() || undefined });
	};

	return (
		<ModalShell title='Tạo permission mới' onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Resource'
					required
					placeholder='vd. catalog'
					hint='Nhóm chức năng, ghép với name theo dạng "resource:name" khi backend kiểm tra quyền.'
					value={resource}
					onChange={(e) => setResource(e.target.value)}
				/>
				<FormControl
					label='Name'
					required
					placeholder='vd. write'
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<FormControl
					as='textarea'
					rows={3}
					label='Mô tả'
					placeholder='Permission này cho phép làm gì (tùy chọn)'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting || !resource.trim() || !name.trim()}>
						{isSubmitting ? "Đang tạo..." : "Tạo permission"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default CreatePermissionModal;
