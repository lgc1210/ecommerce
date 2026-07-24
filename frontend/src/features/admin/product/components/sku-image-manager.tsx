import { StarIcon, TrashIcon } from "../../../../components/icons";
import { useAddSkuImage, useDeleteSkuImage, useUpdateSkuImage } from "../hooks";
import ImageUploadField from "./image-upload-field";
import type { ProductImage } from "../types";

interface SkuImageManagerProps {
	productId: number;
	skuId: number;
	images: ProductImage[];
}

/** Quản lý ảnh của 1 SKU: chọn ảnh trực tiếp từ máy, tự upload rồi lưu URL trả về vào SKU này. */
const SkuImageManager = ({ productId, skuId, images }: SkuImageManagerProps) => {
	const addImage = useAddSkuImage();
	const updateImage = useUpdateSkuImage();
	const deleteImage = useDeleteSkuImage();

	const sortedImages = [...images].sort(
		(a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder,
	);

	const handleImagesUploaded = async (urls: string[]) => {
		// Thêm tuần tự (không Promise.all) — backend tính "ảnh đầu tiên/sortOrder" dựa trên số ảnh
		// đang có tại thời điểm request tới, nếu bắn nhiều request cùng lúc dễ bị đua nhau (2 ảnh
		// cùng được đánh dấu đại diện, hoặc trùng sortOrder).
		for (const url of urls) {
			await addImage.mutateAsync({ productId, skuId, imageUrl: url });
		}
	};

	return (
		<div className='space-y-3'>
			{sortedImages.length > 0 && (
				<div className='flex flex-wrap gap-3'>
					{sortedImages.map((image) => (
						<div
							key={image.id}
							className='group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border'>
							<img src={image.imageUrl} alt={image.altText ?? ""} className='h-full w-full object-cover' />
							{image.isPrimary && (
								<span className='absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white'>
									<StarIcon className='h-3 w-3' />
								</span>
							)}
							<div className='absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
								{!image.isPrimary && (
									<button
										type='button'
										title='Đặt làm ảnh đại diện'
										onClick={() => updateImage.mutate({ productId, skuId, imageId: image.id, isPrimary: true })}
										className='flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white cursor-pointer'>
										<StarIcon className='h-3.5 w-3.5' />
									</button>
								)}
								<button
									type='button'
									title='Xóa ảnh'
									onClick={() => deleteImage.mutate({ productId, skuId, imageId: image.id })}
									className='flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white cursor-pointer'>
									<TrashIcon className='h-3.5 w-3.5' />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<ImageUploadField multiple onUploadMultiple={handleImagesUploaded} hint='Có thể chọn nhiều ảnh cùng lúc.' />
		</div>
	);
};

export default SkuImageManager;
