import {
	useRef,
	type ChangeEvent,
	type ClipboardEvent,
	type KeyboardEvent,
} from "react";

interface FormOtpProps {
	/** Số lượng chữ số của mã, mặc định 6 */
	length?: number;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
	autoFocus?: boolean;
}

const FormOtp = ({
	length = 6,
	value,
	onChange,
	disabled = false,
	error,
	autoFocus = true,
}: FormOtpProps) => {
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
	const digits = Array.from({ length }, (_, index) => value[index] ?? "");

	const setDigitAt = (index: number, digit: string) => {
		const chars = value.padEnd(length, " ").split("");
		chars[index] = digit;
		onChange(chars.join("").trimEnd());
	};

	const focusInput = (index: number) => {
		inputsRef.current[index]?.focus();
		inputsRef.current[index]?.select();
	};

	const handleChange =
		(index: number) => (e: ChangeEvent<HTMLInputElement>) => {
			const digit = e.target.value.replace(/\D/g, "").slice(-1);
			setDigitAt(index, digit);
			if (digit && index < length - 1) focusInput(index + 1);
		};

	const handleKeyDown =
		(index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Backspace") {
				if (digits[index]) {
					setDigitAt(index, "");
				} else if (index > 0) {
					setDigitAt(index - 1, "");
					focusInput(index - 1);
				}
			} else if (e.key === "ArrowLeft" && index > 0) {
				focusInput(index - 1);
			} else if (e.key === "ArrowRight" && index < length - 1) {
				focusInput(index + 1);
			}
		};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
		if (!pasted) return;
		e.preventDefault();
		onChange(pasted.slice(0, length));
		focusInput(Math.min(pasted.length, length - 1));
	};

	return (
		<div>
			<div className='flex items-center justify-center gap-2 sm:gap-3'>
				{digits.map((digit, index) => (
					<input
						key={index}
						ref={(el) => {
							inputsRef.current[index] = el;
						}}
						type='text'
						inputMode='numeric'
						autoComplete={index === 0 ? "one-time-code" : "off"}
						maxLength={1}
						disabled={disabled}
						autoFocus={autoFocus && index === 0}
						value={digit}
						onChange={handleChange(index)}
						onKeyDown={handleKeyDown(index)}
						onPaste={handlePaste}
						className={`h-12 w-11 rounded-xl border bg-cream-soft text-center text-lg font-bold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-12 ${
							error
								? "border-red-400 focus:border-red-500 focus:ring-red-100"
								: "border-border"
						}`}
					/>
				))}
			</div>
			{error && (
				<p className='mt-1.5 text-center text-xs font-medium text-red-500'>
					{error}
				</p>
			)}
		</div>
	);
};

export default FormOtp;
