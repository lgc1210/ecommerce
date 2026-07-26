type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
	/** Kích thước spinner. Mặc định "md". */
	size?: LoadingSize;
	/** Text hiển thị bên dưới spinner. Bỏ trống nếu chỉ cần icon. */
	label?: string;
	/**
	 * true (mặc định): chiếm min-h-[60vh] và canh giữa cả khối — dùng khi loading
	 * thay thế toàn bộ nội dung trang/section. false: chỉ render spinner (+ label)
	 * để tự đặt trong layout khác (vd overlay, 1 vùng nhỏ trong component).
	 */
	fullPage?: boolean;
	className?: string;
}

const sizeClasses: Record<LoadingSize, string> = {
	sm: "h-5 w-5 border-2",
	md: "h-9 w-9 border-[3px]",
	lg: "h-14 w-14 border-4",
};

/** Spinner loading dùng chung cho toàn app, màu theo theme (primary/primary-light). */
const Loading = ({ size = "md", label, fullPage = true, className = "" }: LoadingProps) => {
	const content = (
		<div className='flex flex-col items-center justify-center gap-3'>
			<span
				role='status'
				aria-label={label ?? "Đang tải"}
				className={`inline-block animate-spin rounded-full border-primary-light border-t-primary ${sizeClasses[size]}`}
			/>
			{label && <p className='text-sm text-muted'>{label}</p>}
		</div>
	);

	if (!fullPage) return content;

	return <div className={`flex min-h-[60vh] items-center justify-center ${className}`}>{content}</div>;
};

export default Loading;
