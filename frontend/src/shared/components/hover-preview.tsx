import type { ReactNode } from "react";

type HoverPreviewProps = {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
	contentClassName?: string;
};

const HoverPreview = ({ trigger, children, className = "", contentClassName = "" }: HoverPreviewProps) => {
	return (
		<div className={`group relative inline-flex ${className}`}>
			{trigger}

			{/* pt-2 tạo vùng đệm để rê chuột từ trigger sang preview không bị đóng */}
			<div
				className={`invisible pointer-events-none absolute right-0 top-full z-50 w-88 pt-2 opacity-0 bg-transparent transition-all duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100`}>
				<div className={`translate-y-2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl transition-transform duration-200 group-hover:translate-y-0 ${contentClassName}`}>
					{children}
				</div>
			</div>
		</div>
	);
};

export default HoverPreview;
