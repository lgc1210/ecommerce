import Button from "./button";
import ModalShell from "./modal-shell";

interface PopupProps {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** "danger" cho hành động phá hủy (xóa, thu hồi...), "default" cho hành động thường. */
	variant?: "default" | "danger";
	/** true khi hành động xác nhận đang chạy (disable 2 nút, đổi label nút xác nhận). */
	isConfirming?: boolean;
	onConfirm: () => void;
	onClose: () => void;
}

/**
 * Popup xác nhận hành động, thay cho `window.confirm` (không tùy biến được giao
 * diện, chặn cả trang, và không đồng bộ style với phần còn lại của app).
 * Dựng trên <ModalShell> để dùng chung backdrop/khung/nút đóng với các modal form khác.
 *
 * Không tự quản lý trạng thái mở/đóng — render có điều kiện ở nơi gọi:
 * ```tsx
 * const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(null);
 *
 * {deletingAddress && (
 *   <Popup
 *     title='Xóa địa chỉ'
 *     description={`Bạn có chắc muốn xóa địa chỉ "${deletingAddress.addressLine}"? Hành động này không thể hoàn tác.`}
 *     variant='danger'
 *     confirmLabel='Xóa địa chỉ'
 *     isConfirming={deleteAddress.isPending}
 *     onConfirm={() =>
 *       deleteAddress.mutate(deletingAddress.id, { onSuccess: () => setDeletingAddress(null) })
 *     }
 *     onClose={() => setDeletingAddress(null)}
 *   />
 * )}
 * ```
 */
const Popup = ({
	title,
	description,
	confirmLabel = "Xác nhận",
	cancelLabel = "Hủy",
	variant = "default",
	isConfirming = false,
	onConfirm,
	onClose,
}: PopupProps) => (
	<ModalShell title={title} onClose={onClose} maxWidthClassName='max-w-sm'>
		{description && <p className='text-sm text-muted'>{description}</p>}
		<div className='mt-5 flex justify-end gap-2'>
			<Button variant='outline' size='sm' type='button' disabled={isConfirming} className='text-xs!' onClick={onClose}>
				{cancelLabel}
			</Button>
			<Button
				variant='primary'
				size='sm'
				type='button'
				disabled={isConfirming}
				className={`text-xs! ${variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"}`}
				onClick={onConfirm}>
				{isConfirming ? "Đang xử lý..." : confirmLabel}
			</Button>
		</div>
	</ModalShell>
);

export default Popup;
