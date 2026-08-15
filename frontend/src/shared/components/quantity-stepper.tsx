import Button from "../../components/button";
import { MinusIcon, PlusIcon } from "../../components/icons";

interface QuantityStepperProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
	className?: string;
	btnSize?: "sm" | "md" | "lg";
}

const QuantityStepper = ({ value, onChange, min = 1, max = Number.MAX_SAFE_INTEGER, disabled = false, className = "", btnSize = "md" }: QuantityStepperProps) => {
	const cannotDecrease = disabled || value <= min;
	const cannotIncrease = disabled || value >= max;

	return (
		<div className={`flex items-center rounded-full border border-border ${className}`}>
			<Button
				type='button'
				size={btnSize}
				variant='ghost'
				disabled={cannotDecrease}
				onClick={() => onChange(value - 1)}
				className='flex h-9 w-9 items-center justify-center bg-transparent! p-0! text-ink hover:text-primary-dark'
				aria-label='Giảm số lượng'
				icon={<MinusIcon className='h-3.5 w-3.5' />}
			/>

			<span className='w-8 text-center text-sm font-semibold text-ink'>{value}</span>

			<Button
				type='button'
				size={btnSize}
				variant='ghost'
				disabled={cannotIncrease}
				onClick={() => onChange(value + 1)}
				className='flex h-9 w-9 items-center justify-center bg-transparent! p-0! text-ink hover:text-primary-dark'
				aria-label='Tăng số lượng'
				icon={<PlusIcon className='h-3.5 w-3.5' />}
			/>
		</div>
	);
};

export default QuantityStepper;
