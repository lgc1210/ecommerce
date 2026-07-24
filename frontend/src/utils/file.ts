import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../configs/constants/file";

export const validateFile = (file: File): string | undefined => {
	if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
		return `"${file.name}": chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF.`;
	}
	if (file.size > MAX_FILE_SIZE_BYTES) {
		return `"${file.name}": kích thước vượt quá giới hạn cho phép (tối đa 5MB).`;
	}
	return undefined;
};
