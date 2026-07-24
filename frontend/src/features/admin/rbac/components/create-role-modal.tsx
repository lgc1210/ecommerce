import { useState, type SubmitEvent } from "react";
import Button from "../../../../components/button";
import FormControl from "../../../../components/form-control";
import type { CreateRolePayload, Permission } from "../types";
import FormCheckbox from "../../../../components/form-checkbox";
import ModalShell from "../../../../components/modal-shell";

interface CreateRoleModalProps {
	permissionsByResource: [string, Permission[]][];
	onClose: () => void;
	onSubmit: (payload: CreateRolePayload, permissionIds: number[]) => void;
	isSubmitting: boolean;
}

const CreateRoleModal = ({ permissionsByResource, onClose, onSubmit, isSubmitting }: CreateRoleModalProps) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());

	const togglePermission = (permissionId: number) => {
		setSelectedPermissionIds((prev) => {
			const next = new Set(prev);
			if (next.has(permissionId)) {
				next.delete(permissionId);
			} else {
				next.add(permissionId);
			}
			return next;
		});
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;
		onSubmit({ name: name.trim(), description: description.trim() || undefined }, [...selectedPermissionIds]);
	};

	return (
		<ModalShell title='Tạo role mới' onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Tên role'
					required
					placeholder='vd. moderator'
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<FormControl
					as='textarea'
					rows={2}
					label='Mô tả'
					placeholder='Mô tả ngắn về vai trò của role này (tùy chọn)'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>

				<div>
					<p className='mb-1.5 text-sm font-medium text-ink'>
						Permission <span className='font-normal text-muted'>(tùy chọn — có thể gán/thu hồi lại sau)</span>
					</p>

					{permissionsByResource.length === 0 ? (
						<p className='text-sm text-muted'>Hệ thống chưa có permission nào.</p>
					) : (
						<div className='max-h-64 space-y-4 overflow-y-auto rounded-xl border border-border p-3'>
							{permissionsByResource.map(([resource, resourcePermissions]) => (
								<div key={resource}>
									<p className='mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted'>{resource}</p>
									<div className='grid grid-cols-2 gap-1.5'>
										{resourcePermissions.map((permission) => (
											<FormCheckbox
												key={permission.id}
												label={
													<span className='text-sm text-ink'>
														{permission.resource}:{permission.name}
													</span>
												}
												checked={selectedPermissionIds.has(permission.id)}
												onChange={() => togglePermission(permission.id)}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					{selectedPermissionIds.size > 0 && (
						<p className='mt-1.5 text-xs text-muted'>Đã chọn {selectedPermissionIds.size} permission.</p>
					)}
				</div>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting || !name.trim()}>
						{isSubmitting ? "Đang tạo..." : "Tạo role"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default CreateRoleModal;
