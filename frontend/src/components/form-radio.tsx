import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

type FormRadioVariant = "plain" | "card";

/**
 * Radio tái sử dụng, style đồng bộ với <FormCheckbox>/<FormControl>/<FormSelect>.
 *
 * - variant="plain" (mặc định): input + label cạnh nhau, dùng cho lựa chọn đơn giản.
 * - variant="card": bọc trong khung bo góc, đổi border/nền khi được chọn - dùng cho
 *   danh sách lựa chọn nổi bật như phương thức thanh toán, phương thức vận chuyển...
 *
 * ```tsx
 * <FormRadio
 *   variant='card'
 *   name='payment'
 *   label='Thanh toán khi nhận hàng'
 *   description='Thanh toán bằng tiền mặt khi nhận hàng'
 *   checked={paymentMethod === PAYMENT_METHOD.cod}
 *   onChange={() => setPaymentMethod(PAYMENT_METHOD.cod)}
 * />
 * ```
 */
interface FormRadioProps extends InputHTMLAttributes<HTMLInputElement> {
	label: ReactNode;
	/** Mô tả phụ hiển thị dưới label, chỉ áp dụng ở variant="card". */
	description?: ReactNode;
	error?: string;
	wrapperClassName?: string;
	variant?: FormRadioVariant;
}

const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
	(
		{ label, description, error, wrapperClassName = "", variant = "plain", id, className = "", checked, ...rest },
		ref,
	) => {
		const generatedId = useId();
		const fieldId = id ?? generatedId;

		const inputClassName = `mt-0.5 h-4 w-4 shrink-0 border-transparent outline-none focus:ring-0 bg-gray-200 text-primary checked:bg-primary accent-primary ${className}`;

		if (variant === "card") {
			return (
				<div className={wrapperClassName}>
					<label
						htmlFor={fieldId}
						className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
							checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
						}`}>
						<input id={fieldId} ref={ref} type='radio' checked={checked} className={inputClassName} {...rest} />
						<div>
							<p className='font-medium text-ink'>{label}</p>
							{description && <p className='mt-1 text-sm text-muted'>{description}</p>}
						</div>
					</label>
					{error && <p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p>}
				</div>
			);
		}

		return (
			<div className={wrapperClassName}>
				<label htmlFor={fieldId} className='flex items-start gap-2 text-sm text-ink/80 cursor-pointer'>
					<input id={fieldId} ref={ref} type='radio' checked={checked} className={inputClassName} {...rest} />
					{label}
				</label>
				{error && <p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p>}
			</div>
		);
	},
);

FormRadio.displayName = "FormRadio";

export default FormRadio;
