import type { ReactNode } from "react";
import { XIcon } from "./icons";

interface ModalShellProps {
	title: string;
	onClose: () => void;
	children: ReactNode;
	/** Độ rộng tối đa của modal (class Tailwind), mặc định "max-w-md". */
	maxWidthClassName?: string;
}

/**
 * Khung modal dùng chung cho các form ngắn ở cả admin lẫn client (tạo role, tạo
 * permission, thêm/sửa địa chỉ, ...). Đóng khi click ra ngoài hoặc bấm nút X.
 * Không tự quản lý trạng thái mở/đóng (do component cha quyết định render hay
 * không), nên chỉ cần render có điều kiện ở nơi gọi:
 * `{open && <ModalShell ...>...</ModalShell>}`.
 */
const ModalShell = ({ title, onClose, children, maxWidthClassName = "max-w-md" }: ModalShellProps) => (
	<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
		<div onClick={onClose} className='absolute inset-0 bg-ink/50' />
		<div className={`relative w-full ${maxWidthClassName} rounded-2xl bg-surface p-6 shadow-xl`}>
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='text-lg font-bold text-ink'>{title}</h3>
				<button type='button' onClick={onClose} aria-label='Đóng' className='rounded-lg p-1 text-muted hover:bg-cream-soft hover:text-ink'>
					<XIcon className='h-5 w-5' />
				</button>
			</div>
			{children}
		</div>
	</div>
);

export default ModalShell;
