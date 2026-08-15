import { Resend } from "resend";
import { env } from "./dotenv.js";

// Resend gửi qua HTTPS API (port 443) thay vì SMTP thuần (port 25/465/587) — tránh bị các
// nền tảng hosting (Railway, Render, Heroku...) chặn outbound SMTP ở tầng network. Xem thêm
// lý do đổi từ nodemailer/SMTP sang Resend trong lịch sử trao đổi/README.
const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailInput {
	to: string;
	subject: string;
	html: string;
}

/**
 * Helper gửi email dùng chung cho toàn bộ backend (welcome coupon, welcome user, OTP...).
 * `from` cố định dùng chung 1 địa chỉ/domain đã verify trên Resend (RESEND_FROM_EMAIL) —
 * KHÔNG để từng feature tự khai from riêng, vì Resend yêu cầu domain gửi phải được verify
 * trước, tự ý đổi from ở nơi gọi rất dễ dẫn tới gửi thất bại do domain chưa verify.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to,
		subject,
		html,
	});

	if (error) {
		throw new Error(`Resend gửi email thất bại: ${error.message}`);
	}
}

export default resend;
