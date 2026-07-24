import { useRef, useState, type ChangeEvent } from "react";
import { TrashIcon, UploadIcon } from "../../../../components/icons";
import { useUploadImage } from "../hooks";
import { ACCEPTED_INPUT_ACCEPT } from "../../../../configs/constants/file";
import { validateFile } from "../../../../utils/file";

interface ImageUploadFieldSingleProps {
	multiple?: false;
	/** Ảnh hiện tại (URL). Truyền `null`/`undefined` nếu chỉ dùng làm nút "thêm ảnh mới". */
	value?: string | null;
	onChange: (url: string | null) => void;
	onUploadMultiple?: never;
}

interface ImageUploadFieldMultipleProps {
	multiple: true;
	value?: never;
	onChange?: never;
	/** Gọi 1 lần duy nhất với danh sách URL của các file upload THÀNH CÔNG (file lỗi bị bỏ qua, đã báo lỗi riêng). */
	onUploadMultiple: (urls: string[]) => void;
}

type ImageUploadFieldProps = (ImageUploadFieldSingleProps | ImageUploadFieldMultipleProps) & {
	label?: string;
	hint?: string;
	disabled?: boolean;
};

/**
 * Ô chọn + upload ảnh từ máy. Validate định dạng/dung lượng phía client trước (khớp giới hạn
 * ở backend: jpg/png/webp/gif, tối đa 5MB) để báo lỗi nhanh, backend vẫn tự validate lại.
 *
 * 2 chế độ:
 * - Mặc định (1 ảnh): hiện preview ảnh hiện tại + nút đổi/xóa, gọi `onChange(url | null)`.
 * - `multiple`: cho phép chọn nhiều file trong 1 lần mở hộp thoại, mỗi file được upload
 *   riêng (backend chỉ nhận 1 file/request) nhưng chạy song song; xong hết mới gọi
 *   `onUploadMultiple(urls)` 1 lần với các URL upload thành công.
 */
const ImageUploadField = (props: ImageUploadFieldProps) => {
	const { label, hint, disabled } = props;
	const inputRef = useRef<HTMLInputElement>(null);
	const [clientError, setClientError] = useState<string | undefined>();
	const [isUploadingBatch, setIsUploadingBatch] = useState(false);
	const uploadImage = useUploadImage();

	const isBusy = props.multiple ? isUploadingBatch : uploadImage.isPending;

	const handleSingleFile = (file: File) => {
		if (props.multiple) return; // type guard: chỉ narrow được props trong nhánh này
		const onChange = props.onChange;
		uploadImage.mutate(file, {
			onSuccess: (result) => onChange(result.url),
		});
	};

	const handleMultipleFiles = async (files: File[]) => {
		if (!props.multiple) return; // type guard: chỉ narrow được props trong nhánh này
		const onUploadMultiple = props.onUploadMultiple;

		setIsUploadingBatch(true);
		const results = await Promise.allSettled(files.map((file) => uploadImage.mutateAsync(file)));
		setIsUploadingBatch(false);

		// Lỗi của từng file (nếu có) đã được toast riêng bởi useUploadImage -> ở đây chỉ cần
		// gom URL của các file upload thành công, bỏ qua các file lỗi.
		const urls = results.filter((r) => r.status === "fulfilled").map((r) => r.value.url);
		if (urls.length > 0) onUploadMultiple(urls);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = ""; // reset để có thể chọn lại đúng (các) file đó ở lần sau

		if (files.length === 0) return;
		setClientError(undefined);

		const invalidMessages = files.map(validateFile).filter((message): message is string => Boolean(message));
		if (invalidMessages.length > 0) {
			setClientError(invalidMessages.join(" "));
			return;
		}

		if (props.multiple) {
			void handleMultipleFiles(files);
		} else {
			handleSingleFile(files[0]);
		}
	};

	const buttonLabel = isBusy
		? props.multiple
			? "Đang tải ảnh..."
			: "Đang tải..."
		: props.multiple
			? "Chọn nhiều ảnh từ máy"
			: props.value
				? "Đổi ảnh"
				: "Chọn ảnh từ máy";

	return (
		<div>
			{label && <span className='mb-1.5 block text-sm font-medium text-ink'>{label}</span>}

			<div className='flex items-center gap-3'>
				{!props.multiple && props.value && (
					<div className='group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border'>
						<img src={props.value} alt='' className='h-full w-full object-cover' />
						{!disabled && (
							<button
								type='button'
								title='Xóa ảnh'
								onClick={() => props.onChange(null)}
								className='absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer'>
								<TrashIcon className='h-5 w-5' />
							</button>
						)}
					</div>
				)}

				<button
					type='button'
					disabled={disabled || isBusy}
					onClick={() => inputRef.current?.click()}
					className='flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted transition-colors hover:border-primary hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'>
					<UploadIcon className='h-5 w-5' />
					<span className='px-1 text-center text-[11px] font-medium leading-tight'>{buttonLabel}</span>
				</button>

				<input
					ref={inputRef}
					type='file'
					multiple={props.multiple}
					accept={ACCEPTED_INPUT_ACCEPT}
					className='hidden'
					onChange={handleFileChange}
				/>
			</div>

			{clientError ? (
				<p className='mt-1.5 text-xs font-medium text-red-500'>{clientError}</p>
			) : hint ? (
				<p className='mt-1.5 text-xs text-muted'>{hint}</p>
			) : null}
		</div>
	);
};

export default ImageUploadField;
