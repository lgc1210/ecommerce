import { StarIcon } from "../../../../components/icons";

const StarRating = ({ rating, className = "" }: { rating: number; className?: string }) => (
	<div className={`flex items-center gap-0.5 text-primary ${className}`}>
		{Array.from({ length: 5 }).map((_, i) => (
			<StarIcon key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "text-primary" : "text-border"}`} />
		))}
	</div>
);

export default StarRating;
