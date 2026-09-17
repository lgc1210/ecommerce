import { useState, type SubmitEvent } from "react";
import ModalShell from "../../../../components/modal-shell";
import FormControl from "../../../../components/form-control";
import FormSelect from "../../../../components/form-select";
import FormCheckbox from "../../../../components/form-checkbox";
import Button from "../../../../components/button";
import type { AdminWarrantyPolicy, CreateWarrantyPolicyPayload, UpdateWarrantyPolicyPayload } from "../types";
import { DURATION_UNIT_LABEL, WARRANTY_PROVIDER_TYPE_LABEL, toApproxDays } from "../utils";
import {
	DURATION_UNIT,
	WARRANTY_PROVIDER_TYPE,
	type DurationUnit,
	type WarrantyProviderType,
} from "../../../../shared/constants/warranty";

interface WarrantyPolicyFormModalProps {
	policy?: AdminWarrantyPolicy;
	onClose: () => void;
	onSubmit: (payload: CreateWarrantyPolicyPayload | UpdateWarrantyPolicyPayload) => void;
	isSubmitting: boolean;
}

type Errors = {
	name?: string;
	durationValue?: string;
	exchangePeriodValue?: string;
};

/**
 * Form dùng chung cho tạo mới lẫn sửa chính sách bảo hành. Validate bằng state "errors" + hiển
 * thị qua prop "error" của FormControl, giống pattern CouponFormModal.
 *
 * Checkbox "Có đổi mới 1-đổi-1" bật/tắt cặp field exchangePeriodValue/exchangePeriodUnit — khớp
 * ràng buộc "cùng có hoặc cùng không có giá trị" ở backend (warranty.validation.ts).
 */
const WarrantyPolicyFormModal = ({ policy, onClose, onSubmit, isSubmitting }: WarrantyPolicyFormModalProps) => {
	const isEditing = Boolean(policy);

	const [name, setName] = useState(policy?.name ?? "");
	const [durationValue, setDurationValue] = useState(policy ? String(policy.durationValue) : "12");
	const [durationUnit, setDurationUnit] = useState<DurationUnit>(policy?.durationUnit ?? DURATION_UNIT.month);
	const [warrantyType, setWarrantyType] = useState<WarrantyProviderType>(
		policy?.warrantyType ?? WARRANTY_PROVIDER_TYPE.manufacturer,
	);
	const [hasExchangePeriod, setHasExchangePeriod] = useState(policy?.exchangePeriodValue != null);
	const [exchangePeriodValue, setExchangePeriodValue] = useState(
		policy?.exchangePeriodValue != null ? String(policy.exchangePeriodValue) : "7",
	);
	const [exchangePeriodUnit, setExchangePeriodUnit] = useState<DurationUnit>(
		policy?.exchangePeriodUnit ?? DURATION_UNIT.day,
	);
	const [description, setDescription] = useState(policy?.description ?? "");
	const [errors, setErrors] = useState<Errors>({});

	const validate = () => {
		const nextErrors: Errors = {};
		const durationValueNumber = Number(durationValue);
		const exchangePeriodValueNumber = Number(exchangePeriodValue);

		if (name.trim().length < 2) {
			nextErrors.name = "Tên chính sách phải có ít nhất 2 ký tự.";
		}

		if (!durationValue.trim() || durationValueNumber <= 0) {
			nextErrors.durationValue = "Thời hạn bảo hành phải lớn hơn 0.";
		}

		if (hasExchangePeriod) {
			if (!exchangePeriodValue.trim() || exchangePeriodValueNumber <= 0) {
				nextErrors.exchangePeriodValue = "Thời gian đổi mới phải lớn hơn 0.";
			} else if (
				durationValueNumber > 0 &&
				toApproxDays(exchangePeriodValueNumber, exchangePeriodUnit) > toApproxDays(durationValueNumber, durationUnit)
			) {
				nextErrors.exchangePeriodValue = "Thời gian đổi mới không được dài hơn tổng thời hạn bảo hành.";
			}
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			name: name.trim(),
			durationValue: Number(durationValue),
			durationUnit,
			warrantyType,
			exchangePeriodValue: hasExchangePeriod ? Number(exchangePeriodValue) : null,
			exchangePeriodUnit: hasExchangePeriod ? exchangePeriodUnit : null,
			description: description.trim() || undefined,
		};

		onSubmit(isEditing ? { id: policy!.id, ...payload } : payload);
	};

	return (
		<ModalShell
			title={isEditing ? "Sửa chính sách bảo hành" : "Thêm chính sách bảo hành"}
			onClose={onClose}
			maxWidthClassName='max-w-xl'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<FormControl
					label='Tên chính sách'
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder='Vd: Bảo hành 12 tháng chính hãng'
					error={errors.name}
				/>
				<div className='grid gap-4 sm:grid-cols-3'>
					<FormControl
						label='Thời hạn bảo hành'
						type='number'
						step='any'
						value={durationValue}
						onChange={(e) => setDurationValue(e.target.value)}
						error={errors.durationValue}
						wrapperClassName='sm:col-span-1'
					/>
					<FormSelect
						label='Đơn vị'
						fullWidth
						value={durationUnit}
						onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
						options={Object.entries(DURATION_UNIT_LABEL).map(([value, label]) => ({ value, label }))}
						wrapperClassName='sm:col-span-1'
					/>
					<FormSelect
						label='Bên chịu trách nhiệm'
						fullWidth
						value={warrantyType}
						onChange={(e) => setWarrantyType(e.target.value as WarrantyProviderType)}
						options={Object.entries(WARRANTY_PROVIDER_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
						wrapperClassName='sm:col-span-1'
					/>
				</div>

				<div className='rounded-xl border border-border p-4'>
					<FormCheckbox
						label='Có giai đoạn đổi mới 1-đổi-1 (nếu lỗi do nhà sản xuất)'
						checked={hasExchangePeriod}
						onChange={(e) => setHasExchangePeriod(e.target.checked)}
					/>
					{hasExchangePeriod && (
						<div className='mt-3 grid gap-4 sm:grid-cols-2'>
							<FormControl
								label='Thời gian đổi mới'
								type='number'
								step='any'
								value={exchangePeriodValue}
								onChange={(e) => setExchangePeriodValue(e.target.value)}
								error={errors.exchangePeriodValue}
							/>
							<FormSelect
								label='Đơn vị'
								fullWidth
								value={exchangePeriodUnit}
								onChange={(e) => setExchangePeriodUnit(e.target.value as DurationUnit)}
								options={Object.entries(DURATION_UNIT_LABEL).map(([value, label]) => ({ value, label }))}
							/>
						</div>
					)}
				</div>

				<FormControl
					as='textarea'
					rows={3}
					label='Mô tả (tuỳ chọn)'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder='Ghi chú thêm về điều kiện áp dụng...'
				/>

				<div className='flex justify-end gap-2 pt-2'>
					<Button type='button' variant='outline' size='sm' onClick={onClose}>
						Hủy
					</Button>
					<Button type='submit' size='sm' disabled={isSubmitting}>
						{isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo chính sách"}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
};

export default WarrantyPolicyFormModal;
