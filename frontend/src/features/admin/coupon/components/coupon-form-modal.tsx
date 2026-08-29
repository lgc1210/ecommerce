import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import FormCheckbox from "../../../../components/form-checkbox";
import Button from "../../../../components/button";
import type { AdminCoupon, CreateCouponPayload, UpdateCouponPayload } from "../types";
import { DISCOUNT_TYPE_LABEL, fromDatetimeLocalValue, toDatetimeLocalValue } from "../utils";
import type { DiscountType } from "../../../../shared/constants/coupon";

interface CouponFormModalProps {
	coupon?: AdminCoupon;
	onClose: () => void;
	onSubmit: (payload: CreateCouponPayload | UpdateCouponPayload) => void;
	isSubmitting: boolean;
}

type Errors = {
	code?: string;
	discountValue?: string;
	minOrderValue?: string;
	maxDiscountValue?: string;
	startsAt?: string;
	expiresAt?: string;
	usageLimit?: string;
};

const COUPON_CODE_REGEX = /^[A-Za-z0-9_-]+$/;

const defaultStartsAt = () => toDatetimeLocalValue(new Date().toISOString());
const defaultExpiresAt = () => {
	const in7Days = new Date();
	in7Days.setDate(in7Days.getDate() + 7);
	return toDatetimeLocalValue(in7Days.toISOString());
};

/**
 * Form dùng chung cho tạo mới lẫn sửa mã giảm giá. Validate bằng state "errors"
 * + hiển thị qua prop "error" của FormControl (giống pattern ở LoginPage/
 * ContactPage), KHÔNG dùng thuộc tính HTML5 "required"/"min"/"max" — tránh
 * trình duyệt tự bật tooltip mặc định không đồng bộ giao diện.
 */
const CouponFormModal = ({ coupon, onClose, onSubmit, isSubmitting }: CouponFormModalProps) => {
	const isEditing = Boolean(coupon);

	const [code, setCode] = useState(coupon?.code ?? "");
	const [discountType, setDiscountType] = useState<DiscountType>(coupon?.discountType ?? "percentage");
	const [discountValue, setDiscountValue] = useState(coupon ? String(Number(coupon.discountValue)) : "");
	const [minOrderValue, setMinOrderValue] = useState(coupon ? String(Number(coupon.minOrderValue)) : "0");
	const [maxDiscountValue, setMaxDiscountValue] = useState(coupon?.maxDiscountValue ? String(Number(coupon.maxDiscountValue)) : "");
	const [startsAt, setStartsAt] = useState(coupon ? toDatetimeLocalValue(coupon.startsAt) : defaultStartsAt());
	const [expiresAt, setExpiresAt] = useState(coupon ? toDatetimeLocalValue(coupon.expiresAt) : defaultExpiresAt());
	const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : "");
	const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
	const [errors, setErrors] = useState<Errors>({});

	const validate = () => {
		const nextErrors: Errors = {};
		const discountValueNumber = Number(discountValue);
		const minOrderValueNumber = Number(minOrderValue);
		const maxDiscountValueNumber = Number(maxDiscountValue);
		const usageLimitNumber = Number(usageLimit);

		if (code.trim().length < 3) {
			nextErrors.code = "Mã giảm giá phải có ít nhất 3 ký tự.";
		} else if (!COUPON_CODE_REGEX.test(code.trim())) {
			nextErrors.code = "Chỉ được chứa chữ, số, gạch ngang và gạch dưới.";
		}

		if (!discountValue.trim() || discountValueNumber <= 0) {
			nextErrors.discountValue = "Giá trị giảm giá phải lớn hơn 0.";
		} else if (discountType === "percentage" && discountValueNumber > 100) {
			nextErrors.discountValue = "Giảm giá theo % không được vượt quá 100.";
		}

		if (minOrderValue.trim() && minOrderValueNumber < 0) {
			nextErrors.minOrderValue = "Giá trị đơn hàng tối thiểu không được âm.";
		}

		if (maxDiscountValue.trim() && maxDiscountValueNumber <= 0) {
			nextErrors.maxDiscountValue = "Mức giảm tối đa phải lớn hơn 0.";
		}

		if (!startsAt) {
			nextErrors.startsAt = "Vui lòng chọn ngày bắt đầu.";
		}
		if (!expiresAt) {
			nextErrors.expiresAt = "Vui lòng chọn ngày hết hạn.";
		} else if (startsAt && new Date(expiresAt) <= new Date(startsAt)) {
			nextErrors.expiresAt = "Ngày hết hạn phải sau ngày bắt đầu.";
		}

		if (usageLimit.trim() && usageLimitNumber <= 0) {
			nextErrors.usageLimit = "Giới hạn lượt dùng phải lớn hơn 0.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			code: code.trim().toUpperCase(),
			discountType,
			discountValue: Number(discountValue),
			minOrderValue: minOrderValue.trim() ? Number(minOrderValue) : 0,
			maxDiscountValue: maxDiscountValue.trim() ? Number(maxDiscountValue) : null,
			startsAt: fromDatetimeLocalValue(startsAt),
			expiresAt: fromDatetimeLocalValue(expiresAt),
			usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
			isActive,
		};

		onSubmit(isEditing ? { id: coupon!.id, ...payload } : payload);
	};

	return (
		<ModalShell title={isEditing ? "Sửa mã giảm giá" : "Thêm mã giảm giá"} onClose={onClose} maxWidthClassName='max-w-xl'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Mã giảm giá'
					value={code}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
					hint='Chỉ chữ, số, gạch ngang và gạch dưới, vd: "SALE10". Tự động viết hoa.'
					error={errors.code}
				/>
				<div className='grid gap-4 sm:grid-cols-2'>
					<FormSelect
						label='Loại giảm giá'
						fullWidth
						value={discountType}
						onChange={(e) => setDiscountType(e.target.value as DiscountType)}
						options={Object.entries(DISCOUNT_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
					/>
					<FormControl
						label={discountType === "percentage" ? "Giá trị giảm (%)" : "Giá trị giảm (đ)"}
						type='number'
						step='any'
						value={discountValue}
						onChange={(e) => setDiscountValue(e.target.value)}
						error={errors.discountValue}
					/>
				</div>
				<div className='grid gap-4 sm:grid-cols-2'>
					<FormControl label='Đơn hàng tối thiểu (đ)' type='number' step='any' value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} error={errors.minOrderValue} />
					<FormControl
						label='Mức giảm tối đa (đ)'
						type='number'
						step='any'
						value={maxDiscountValue}
						onChange={(e) => setMaxDiscountValue(e.target.value)}
						placeholder='Không giới hạn'
						hint={discountType === "fixed" ? "Chỉ áp dụng cho giảm theo %, bỏ trống nếu không cần." : undefined}
						error={errors.maxDiscountValue}
					/>
				</div>
				<div className='grid gap-4 sm:grid-cols-2'>
					<FormControl label='Bắt đầu' type='datetime-local' value={startsAt} onChange={(e) => setStartsAt(e.target.value)} error={errors.startsAt} />
					<FormControl label='Hết hạn' type='datetime-local' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} error={errors.expiresAt} />
				</div>
				<FormControl label='Giới hạn lượt sử dụng' type='number' step='any' value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder='Không giới hạn' error={errors.usageLimit} />
				<FormCheckbox label='Kích hoạt mã giảm giá này ngay' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo mã giảm giá"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default CouponFormModal;
