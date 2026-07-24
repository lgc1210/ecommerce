import {
	forwardRef,
	useId,
	useState,
	type InputHTMLAttributes,
	type ReactNode,
	type Ref,
	type TextareaHTMLAttributes,
} from "react";

type FormControlVariant = "cream" | "surface";

interface BaseFormControlProps {
	label?: string;
	error?: string;
	hint?: string;
	variant?: FormControlVariant;
	wrapperClassName?: string;
	rightElement?: ReactNode;
}

type FormControlInputProps = BaseFormControlProps &
	InputHTMLAttributes<HTMLInputElement> & {
		as?: "input";
	};

type FormControlTextareaProps = BaseFormControlProps &
	TextareaHTMLAttributes<HTMLTextAreaElement> & {
		as: "textarea";
	};

export type FormControlProps = FormControlInputProps | FormControlTextareaProps;

const variantClasses: Record<FormControlVariant, string> = {
	cream: "bg-cream-soft",
	surface: "bg-surface",
};

const baseFieldClasses =
	"w-full rounded-xl border border-border text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60";

const FormControl = forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	FormControlProps
>((props, ref) => {
	const {
		label,
		error,
		hint,
		variant = "cream",
		wrapperClassName = "",
		rightElement,
		id,
		className = "",
		required,
		...rest
	} = props;

	const generatedId = useId();
	const fieldId = id ?? generatedId;
	const [showPassword, setShowPassword] = useState(false);

	const isTextarea = props.as === "textarea";
	const isPasswordField =
		!isTextarea &&
		(rest as InputHTMLAttributes<HTMLInputElement>).type === "password";

	const fieldClasses = [
		baseFieldClasses,
		variantClasses[variant],
		isTextarea ? "resize-none py-3" : "h-12 px-4",
		isTextarea ? "px-4" : "",
		isPasswordField ? "pr-16" : rightElement ? "pr-12" : "",
		error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={wrapperClassName}>
			{label && (
				<label
					htmlFor={fieldId}
					className='mb-1.5 block text-sm font-medium text-ink'>
					{label}
					{required && <span className='ml-0.5 text-red-500'>*</span>}
				</label>
			)}

			<div className='relative'>
				{isTextarea ? (
					<textarea
						id={fieldId}
						ref={ref as Ref<HTMLTextAreaElement>}
						required={required}
						className={fieldClasses}
						{...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
					/>
				) : (
					<input
						id={fieldId}
						ref={ref as Ref<HTMLInputElement>}
						required={required}
						className={fieldClasses}
						{...(rest as InputHTMLAttributes<HTMLInputElement>)}
						type={
							isPasswordField
								? showPassword
									? "text"
									: "password"
								: (rest as InputHTMLAttributes<HTMLInputElement>).type
						}
					/>
				)}

				{isPasswordField && (
					<button
						type='button'
						tabIndex={-1}
						onClick={() => setShowPassword((prev) => !prev)}
						className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary-dark cursor-pointer'>
						{showPassword ? "Ẩn" : "Hiện"}
					</button>
				)}

				{!isPasswordField && rightElement && (
					<div className='absolute right-4 top-1/2 -translate-y-1/2'>
						{rightElement}
					</div>
				)}
			</div>

			{error ? (
				<p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p>
			) : hint ? (
				<p className='mt-1.5 text-xs text-muted'>{hint}</p>
			) : null}
		</div>
	);
});

FormControl.displayName = "FormControl";

export default FormControl;
