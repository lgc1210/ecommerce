import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import FormCheckbox from "../../../../components/form-checkbox";
import Button from "../../../../components/button";
import { useCategoryTreeQuery } from "../../category/hooks";
import { flattenCategoryTree } from "../../category/utils";
import ImageUploadField from "./image-upload-field";
import type { AdminProductDetail, CreateProductPayload, UpdateProductPayload } from "../types";

interface ProductFormModalProps {
	/** Có giá trị -> đang sửa sản phẩm này. Không có -> đang tạo mới. */
	product?: AdminProductDetail;
	onClose: () => void;
	onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => void;
	isSubmitting: boolean;
}

type Errors = { name?: string; slug?: string; description?: string };

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Form dùng chung cho tạo mới lẫn sửa thông tin cơ bản của sản phẩm (chưa gồm
 * SKU/ảnh — 2 phần đó chỉ quản lý được ở trang chi tiết sau khi sản phẩm đã
 * tồn tại). Validate bằng state "errors" + prop "error" của FormControl.
 */
const ProductFormModal = ({ product, onClose, onSubmit, isSubmitting }: ProductFormModalProps) => {
	const isEditing = Boolean(product);

	const [name, setName] = useState(product?.name ?? "");
	const [slug, setSlug] = useState(product?.slug ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [categoryId, setCategoryId] = useState<number | "">(product?.categoryId ?? "");
	const [isActive, setIsActive] = useState(product?.isActive ?? true);
	const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(product?.thumbnailUrl ?? null);
	const [errors, setErrors] = useState<Errors>({});

	const { data: categoryTree = [] } = useCategoryTreeQuery();
	const categoryOptions = flattenCategoryTree(categoryTree);

	const validate = () => {
		const nextErrors: Errors = {};

		if (name.trim().length < 2) {
			nextErrors.name = "Tên sản phẩm phải có ít nhất 2 ký tự.";
		}
		if (slug.trim() && !SLUG_REGEX.test(slug.trim())) {
			nextErrors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			name: name.trim(),
			...(slug.trim() ? { slug: slug.trim() } : {}),
			...(isEditing || description.trim() ? { description: description.trim() } : {}),
			categoryId: categoryId === "" ? null : Number(categoryId),
			isActive,
			isFeatured,
			// CreateProductSchema chỉ nhận string|undefined (không nhận null) cho thumbnailUrl, còn
			// UpdateProductSchema cho phép null để admin chủ động xóa thumbnail đã chọn trước đó.
			...(isEditing ? { thumbnailUrl } : thumbnailUrl ? { thumbnailUrl } : {}),
		};

		onSubmit(isEditing ? { id: product!.id, ...payload } : payload);
	};

	return (
		<ModalShell title={isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"} onClose={onClose} maxWidthClassName='max-w-2xl'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<ImageUploadField
					label='Ảnh đại diện (thumbnail)'
					value={thumbnailUrl}
					onChange={setThumbnailUrl}
					hint='Ảnh này sẽ tự động được thay thế nếu sau đó bạn thêm ảnh cho biến thể (SKU) đầu tiên.'
				/>

				<FormControl label='Tên sản phẩm' value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
				<FormControl
					label='Slug'
					value={slug}
					onChange={(e) => setSlug(e.target.value)}
					placeholder='Tự sinh từ tên nếu để trống'
					hint='Chỉ chữ thường, số và dấu gạch ngang, vd: "ao-thun-cotton-basic".'
					error={errors.slug}
				/>
				<FormControl as='textarea' label='Mô tả' rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
				<FormSelect
					label='Danh mục'
					fullWidth
					value={categoryId}
					onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
					placeholder='— Không có danh mục —'
					options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
				/>
				<FormCheckbox label='Cho phép hiển thị và bán sản phẩm này ngay' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
				<FormCheckbox label='Đánh dấu là sản phẩm nổi bật (hiển thị ở carousel trang chủ)' checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />

				{isEditing && <p className='text-xs text-muted'>Quản lý biến thể (SKU) và hình ảnh ở trang chi tiết sau khi lưu.</p>}

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default ProductFormModal;
