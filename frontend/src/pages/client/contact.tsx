import { useState, type SubmitEvent } from "react";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import FormControl from "../../components/form-control";
import { HeadsetIcon, MailIcon, MapPinIcon, PhoneIcon } from "../../components/icons";
import { useSendContact } from "../../features/client/contact/hooks/useContact";
import type { ContactPayload } from "../../features/client/contact/types";
import EmbeddedMap from "../../features/client/contact/components/embedded-map";

const contactInfo = [
	{
		icon: MapPinIcon,
		title: "Địa chỉ",
		lines: ["Toà nhà Ecommerce, Quận 8", "TP. Hồ Chí Minh, Việt Nam"],
	},
	{
		icon: PhoneIcon,
		title: "Điện thoại",
		lines: ["0123 456 789", "Thứ 2 - Thứ 7, 8:00 - 18:00"],
	},
	{
		icon: MailIcon,
		title: "Email",
		lines: ["support@ecommerce.vn", "Phản hồi trong 24 giờ"],
	},
	{
		icon: HeadsetIcon,
		title: "Hỗ trợ",
		lines: ["Trò chuyện trực tuyến 24/7", "Hotline khẩn cấp có sẵn"],
	},
];

const initialForm = { name: "", email: "", subject: "", message: "" };

type Errors = {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
};

/**
 * Trang "Liên hệ". Form gửi thẳng tới POST /contacts (public, không cần đăng
 * nhập, nhưng nếu khách đang đăng nhập thì backend tự gắn userId — xem
 * middleware authenticateOptional). "subject" là optional ở backend nên chỉ
 * gửi khi người dùng có nhập, để lưu đúng null thay vì chuỗi rỗng khi bỏ trống.
 *
 * Validate ở client bằng state "errors" + hiển thị qua prop "error" của
 * FormControl (giống pattern ở LoginPage/RegisterPage), KHÔNG dùng thuộc tính
 * HTML5 "required" — vì required sẽ khiến trình duyệt hiện tooltip mặc định
 * (không đồng bộ giao diện, không style theo design system) thay vì khối lỗi
 * viền đỏ + dòng chữ đỏ nhất quán với toàn bộ form khác trong app.
 * Lỗi validate (400) còn sót từ backend được hiển thị qua toast (xem
 * getApiErrorMessage), vì backend trả về đúng 1 message lỗi đầu tiên chứ không
 * phải lỗi theo từng field.
 */
const ContactPage = () => {
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState<Errors>({});
	const sendContact = useSendContact();

	const validate = () => {
		const nextErrors: Errors = {};

		if (form.name.trim().length < 2) {
			nextErrors.name = "Họ tên phải có ít nhất 2 ký tự.";
		}
		if (!form.email.trim()) {
			nextErrors.email = "Vui lòng nhập email.";
		}
		if (!form.subject.trim()) {
			nextErrors.subject = "Vui lòng nhập chủ đề.";
		}
		if (form.message.trim().length < 10) {
			nextErrors.message = "Nội dung phải có ít nhất 10 ký tự.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
	};

	const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!validate()) return;

		const payload: ContactPayload = {
			name: form.name,
			email: form.email,
			message: form.message,
			subject: form.subject,
		};

		sendContact.mutate(payload, {
			onSuccess: () => {
				setForm(initialForm);
				setErrors({});
			},
		});
	};

	return (
		<div>
			<BreadCrumb title='Liên hệ' description='Có câu hỏi hoặc cần hỗ trợ? Đội ngũ Ecommerce luôn sẵn sàng.' />

			<div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
				<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{contactInfo.map(({ icon: Icon, title, lines }) => (
						<div key={title} className='rounded-2xl border border-border bg-surface p-6'>
							<span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary-dark'>
								<Icon className='h-5 w-5' />
							</span>
							<h3 className='mt-4 font-bold text-ink'>{title}</h3>
							{lines.map((line) => (
								<p key={line} className='mt-1 text-sm text-muted'>
									{line}
								</p>
							))}
						</div>
					))}
				</div>

				<div className='mt-14 grid gap-10 lg:grid-cols-2'>
					<div className='overflow-hidden rounded-2xl border border-border bg-cream-soft'>
						<EmbeddedMap />
					</div>

					<div>
						<h2 className='text-2xl font-extrabold tracking-tight text-ink'>Gửi tin nhắn cho chúng tôi</h2>
						<p className='mt-2 text-sm text-muted'>
							Điền thông tin bên dưới, đội ngũ Ecommerce sẽ liên hệ lại trong thời gian sớm nhất.
						</p>

						<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<FormControl
									variant='surface'
									name='name'
									value={form.name}
									onChange={handleChange("name")}
									placeholder='Họ và tên'
									maxLength={100}
									error={errors.name}
								/>
								<FormControl
									variant='surface'
									type='email'
									name='email'
									value={form.email}
									onChange={handleChange("email")}
									placeholder='Email'
									maxLength={255}
									error={errors.email}
								/>
							</div>
							<FormControl
								variant='surface'
								name='subject'
								value={form.subject}
								onChange={handleChange("subject")}
								placeholder='Chủ đề'
								maxLength={255}
								error={errors.subject}
							/>
							<FormControl
								as='textarea'
								variant='surface'
								rows={5}
								name='message'
								value={form.message}
								onChange={handleChange("message")}
								placeholder='Nội dung tin nhắn'
								maxLength={5000}
								error={errors.message}
							/>
							<Button type='submit' disabled={sendContact.isPending} fullWidth>
								{sendContact.isPending ? "Đang gửi..." : "Gửi tin nhắn"}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
