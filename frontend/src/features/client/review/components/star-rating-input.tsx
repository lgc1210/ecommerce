import { useState } from "react";
import { StarIcon } from "../../../../components/icons";

interface StarRatingInputProps {
	value: number;
	onChange: (value: number) => void;
	error?: string;
}

/** Chọn điểm đánh giá 1-5 sao bằng click, có hover preview — dùng trong form viết/sửa đánh giá. */
const StarRatingInput = ({ value, onChange, error }: StarRatingInputProps) => {
	const [hovered, setHovered] = useState<number | null>(null);
	const displayValue = hovered ?? value;

	return (
		<div>
			<div className='flex items-center gap-1' onMouseLeave={() => setHovered(null)}>
				{[1, 2, 3, 4, 5].map((star) => (
					<button key={star} type='button' onClick={() => onChange(star)} onMouseEnter={() => setHovered(star)} aria-label={`${star} sao`} className='cursor-default p-0.5'>
						<StarIcon className={`h-7 w-7 transition-colors ${star <= displayValue ? "text-primary" : "text-border"}`} />
					</button>
				))}
			</div>
			{error && <p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p>}
		</div>
	);
};

export default StarRatingInput;
