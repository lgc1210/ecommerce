import { useRef, useState, type ChangeEvent } from "react";
import { TrashIcon, UploadIcon } from "../../../../components/icons";
import { useUploadClaimImage } from "../hooks";
import { ACCEPTED_INPUT_ACCEPT } from "../../../../configs/constants/file";
import { validateFile } from "../../../../utils/file";

interface ClaimImageUploadFieldProps {
	value: string[];
	onChange: (urls: string[]) => void;
	disabled?: boolean;
	maxFiles?: number;
}

/**
 * Ô chọn + upload nhiều ảnh minh chứng lỗi cho warranty claim — mirror UI của ImageUploadField
 * (features/admin/product/components) nhưng dùng useUploadClaimImage (endpoint riêng cho khách,
 * warranty_claim:create) thay vì useUploadImage (admin, catalog:write). Không tái sử dụng thẳng
 * component bên admin vì 2 feature không nên cross-import lẫn nhau.
 */
const ClaimImageUploadField = ({ value, onChange, disabled, maxFiles = 10 }: ClaimImageUploadFieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [clientError, setClientError] = useState<string | undefined>();
	const [isUploading, setIsUploading] = useState(false);
	const uploadImage = useUploadClaimImage();

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = ""; // reset để có thể chọn lại đúng (các) file đó ở lần sau
		if (files.length === 0) return;

		setClientError(undefined);

		if (value.length + files.length > maxFiles) {
			setClientError(`Tối đa ${maxFiles} ảnh/video minh chứng.`);
			return;
		}

		const invalidMessages = files.map(validateFile).filter((message): message is string => Boolean(message));
		if (invalidMessages.length > 0) {
			setClientError(invalidMessages.join(" "));
			return;
		}

		setIsUploading(true);
		const results = await Promise.allSettled(files.map((file) => uploadImage.mutateAsync(file)));
		setIsUploading(false);

		const uploadedUrls = results.filter((r) => r.status === "fulfilled").map((r) => r.value.url);
		const failedCount = results.filter((r) => r.status === "rejected").length;
		if (failedCount > 0) {
			setClientError(`${failedCount} ảnh tải lên thất bại, vui lòng thử lại.`);
		}
		if (uploadedUrls.length > 0) {
			onChange([...value, ...uploadedUrls]);
		}
	};

	const handleRemove = (url: string) => {
		onChange(value.filter((u) => u !== url));
	};

	return (
		<div>
			<span className='mb-1.5 block text-sm font-medium text-ink'>Ảnh/video minh chứng lỗi (tuỳ chọn)</span>

			<div className='flex flex-wrap items-center gap-3'>
				{value.map((url) => (
					<div key={url} className='group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border'>
						<img src={url} alt='Ảnh minh chứng' className='h-full w-full object-cover' />
						{!disabled && (
							<button
								type='button'
								title='Xóa ảnh'
								onClick={() => handleRemove(url)}
								className='absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer'>
								<TrashIcon className='h-4 w-4' />
							</button>
						)}
					</div>
				))}

				{value.length < maxFiles && (
					<button
						type='button'
						disabled={disabled || isUploading}
						onClick={() => inputRef.current?.click()}
						className='flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted transition-colors hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'>
						<UploadIcon className='h-4 w-4' />
						<span className='px-1 text-center text-[10px] font-medium leading-tight'>
							{isUploading ? "Đang tải..." : "Thêm ảnh"}
						</span>
					</button>
				)}

				<input
					ref={inputRef}
					type='file'
					multiple
					accept={ACCEPTED_INPUT_ACCEPT}
					className='hidden'
					onChange={handleFileChange}
				/>
			</div>

			{clientError && <p className='mt-1.5 text-xs font-medium text-red-500'>{clientError}</p>}
		</div>
	);
};

export default ClaimImageUploadField;
