import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import Button from "../../../../components/button";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "../types";
import type { FlatCategoryOption } from "../utils";

interface CategoryFormModalProps {
	/** Có giá trị -> đang sửa danh mục này. Không có -> đang tạo mới. */
	category?: Category;
	/** Chỉ dùng khi tạo mới: preset sẵn danh mục cha (vd. bấm "Thêm danh mục con" từ 1 node). */
	initialParentId?: number | null;
	/** Danh sách phẳng đã loại bỏ chính node đang sửa + toàn bộ hậu duệ của nó (xem collectSubtreeIds). */
	parentOptions: FlatCategoryOption[];
	onClose: () => void;
	onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
	isSubmitting: boolean;
}

/** Form dùng chung cho tạo mới lẫn sửa danh mục (khác nhau ở việc có `category` truyền vào hay không). */
const CategoryFormModal = ({
	category,
	initialParentId,
	parentOptions,
	onClose,
	onSubmit,
	isSubmitting,
}: CategoryFormModalProps) => {
	const isEditing = Boolean(category);

	const [name, setName] = useState(category?.name ?? "");
	const [slug, setSlug] = useState(category?.slug ?? "");
	const [description, setDescription] = useState(category?.description ?? "");
	const [parentId, setParentId] = useState<number | "">(category?.parentId ?? initialParentId ?? "");

	const isValid = name.trim().length >= 2;

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isValid) return;

		const basePayload = {
			name: name.trim(),
			// slug bỏ trống -> không gửi field này, để backend tự sinh từ "name" (slugify + auto-suffix nếu trùng).
			...(slug.trim() ? { slug: slug.trim() } : {}),
			// description rỗng vẫn cần gửi "" khi sửa để xóa mô tả cũ đi; khi tạo mới thì bỏ hẳn field nếu rỗng.
			...(isEditing || description.trim() ? { description: description.trim() } : {}),
			parentId: parentId === "" ? null : Number(parentId),
		};

		onSubmit(isEditing ? { id: category!.id, ...basePayload } : basePayload);
	};

	return (
		<ModalShell title={isEditing ? "Sửa danh mục" : "Thêm danh mục"} onClose={onClose}>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Tên danh mục'
					required
					minLength={2}
					maxLength={100}
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<FormControl
					label='Slug'
					value={slug}
					onChange={(e) => setSlug(e.target.value)}
					placeholder='Tự sinh từ tên nếu để trống'
					maxLength={100}
					hint='Chỉ chữ thường, số và dấu gạch ngang, vd: "do-gia-dung". Để trống để tự sinh từ tên danh mục.'
				/>
				<FormControl
					as='textarea'
					label='Mô tả'
					rows={3}
					maxLength={5000}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<FormSelect
					label='Danh mục cha'
					fullWidth
					value={parentId}
					onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
					placeholder='— Không có (danh mục gốc) —'
					options={parentOptions.map((option) => ({ value: option.id, label: option.label }))}
				/>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={!isValid || isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo danh mục"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default CategoryFormModal;
