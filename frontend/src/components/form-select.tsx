import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";

type FormSelectSize = "sm" | "md";

export interface FormSelectOption {
	value: string | number;
	label: string;
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
	label?: string;
	error?: string;
	hint?: string;
	wrapperClassName?: string;
	/** "md" (mặc định): select đầy đủ, full-width — dùng cho filter/form thông thường.
	 *  "sm": select gọn, rộng theo nội dung — dùng cho select lồng trong bảng, Pagination... */
	size?: FormSelectSize;
	/** Danh sách option value/label. Nếu cần tùy biến từng <option> (icon, class riêng...), dùng `children` thay vì `options`. */
	options?: FormSelectOption[];
	/** Option rỗng đầu tiên (value=""), dùng cho filter kiểu "Tất cả...". */
	placeholder?: string;
	/** true để select giãn full-width (dùng khi xếp dọc trong 1 form). Mặc định false — select rộng theo nội dung, phù hợp với thanh filter/table nằm ngang. */
	fullWidth?: boolean;
	children?: ReactNode;
}

const sizeClasses: Record<FormSelectSize, string> = {
	md: "h-12 rounded-xl px-4 text-sm",
	sm: "rounded-lg px-2.5 py-1.5 text-xs",
};

const baseClasses =
	"border bg-cream-soft text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60 hover:not-disabled:cursor-default appearance-none bg-none";

/**
 * Select dùng chung, style đồng bộ với <FormControl>. Dùng cho mọi dropdown lọc/chọn
 * trong app (lọc theo role/trạng thái, đổi role trong bảng, chọn số item/trang...).
 *
 * ```tsx
 * <FormSelect
 *   label='Role'
 *   value={roleId ?? ""}
 *   onChange={(e) => setFilter("roleId", e.target.value || undefined)}
 *   placeholder='Tất cả role'
 *   options={roles.map((role) => ({ value: role.id, label: role.name }))}
 * />
 * ```
 */
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>((props, ref) => {
	const { label, error, hint, wrapperClassName = "", size = "md", options, placeholder, fullWidth = false, id, className = "", children, ...rest } = props;

	const generatedId = useId();
	const fieldId = id ?? generatedId;

	const fieldClasses = [baseClasses, sizeClasses[size], fullWidth ? "w-full" : "", error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-border", className]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={wrapperClassName}>
			{label && (
				<label htmlFor={fieldId} className='mb-1.5 block text-sm font-medium text-ink'>
					{label}
				</label>
			)}

			<select id={fieldId} ref={ref} className={fieldClasses} {...rest}>
				{placeholder !== undefined && <option value=''>{placeholder}</option>}
				{options
					? options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))
					: children}
			</select>

			{error ? <p className='mt-1.5 text-xs font-medium text-red-500'>{error}</p> : hint ? <p className='mt-1.5 text-xs text-muted'>{hint}</p> : null}
		</div>
	);
});

FormSelect.displayName = "FormSelect";

export default FormSelect;
