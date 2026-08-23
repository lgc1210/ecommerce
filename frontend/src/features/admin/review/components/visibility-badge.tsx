const VisibilityBadge = ({ isVisible }: { isVisible: boolean }) => (
	<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isVisible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
		{isVisible ? "Đang hiển thị" : "Đã ẩn"}
	</span>
);

export default VisibilityBadge;
