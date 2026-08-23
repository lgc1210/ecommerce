import { StarIcon } from "../../../../components/icons";

interface StarRatingProps {
	/** Điểm đánh giá, có thể là số thập phân (vd. điểm trung bình 4.3) — phần lẻ không tô sao riêng, chỉ làm tròn khi tô. */
	rating: number;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses: Record<NonNullable<StarRatingProps["size"]>, string> = {
	sm: "h-3.5 w-3.5",
	md: "h-4 w-4",
	lg: "h-5 w-5",
};

/** Hiển thị 5 sao chỉ để xem (không tương tác) — dùng cho review đã có, điểm trung bình sản phẩm... */
const StarRating = ({ rating, size = "md", className = "" }: StarRatingProps) => (
	<div className={`flex items-center gap-0.5 text-primary ${className}`}>
		{Array.from({ length: 5 }).map((_, i) => (
			<StarIcon key={i} className={`${sizeClasses[size]} ${i < Math.round(rating) ? "text-primary" : "text-border"}`} />
		))}
	</div>
);

export default StarRating;
