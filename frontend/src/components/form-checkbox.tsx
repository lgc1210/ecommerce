import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * Checkbox tái sử dụng cho các trường hợp: ghi nhớ đăng nhập, đồng ý điều khoản, v.v.
 */
interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
	label: ReactNode;
	error?: string;
	wrapperClassName?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
	({ label, error, wrapperClassName = "", id, className = "", ...rest }, ref) => {
		const generatedId = useId();
		const fieldId = id ?? generatedId;

		return (
			<div className={wrapperClassName}>
				<label htmlFor={fieldId} className='flex items-start gap-2 text-sm text-ink/80 cursor-pointer'>
					<input
						id={fieldId}
						ref={ref}
						type='checkbox'
						className={`mt-0.5 h-4 w-4 rounded border-transparent outline-none focus:ring-0 bg-gray-200 text-primary checked:bg-primary accent-primary ${className}`}
						{...rest}
					/>
					{label}
				</label>
				{error && <p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p>}
			</div>
		);
	},
);

FormCheckbox.displayName = "FormCheckbox";

export default FormCheckbox;
