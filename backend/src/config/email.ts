import { BrevoClient, BrevoError } from "@getbrevo/brevo";
import { env } from "./dotenv.js";

// Brevo gửi qua HTTPS API (port 443) thay vì SMTP thuần (port 25/465/587) — tránh bị các nền
// tảng hosting (Railway, Render, Heroku...) chặn outbound SMTP ở tầng network. Đổi từ Resend sang
// Brevo vì Resend ở gói miễn phí CHƯA verify domain riêng chỉ cho gửi email tới đúng địa chỉ đã
// đăng ký tài khoản Resend — không dùng được cho user thật. Brevo không có giới hạn này miễn là
// sender email (BREVO_SENDER_EMAIL) đã được verify (verify 1 email đơn lẻ, không cần verify domain).
const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

interface SendEmailInput {
	to: string;
	subject: string;
	html: string;
}

/**
 * Helper gửi email dùng chung cho toàn bộ backend (welcome coupon, welcome user, OTP...).
 * `sender` cố định dùng chung 1 email đã verify trên Brevo (BREVO_SENDER_EMAIL/BREVO_SENDER_NAME) —
 * KHÔNG để từng feature tự khai sender riêng, vì Brevo yêu cầu sender phải được verify trước, tự ý
 * đổi sender ở nơi gọi rất dễ dẫn tới gửi thất bại do email chưa verify.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
	try {
		await brevo.transactionalEmails.sendTransacEmail({
			sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
			to: [{ email: to }],
			subject,
			htmlContent: html,
		});
	} catch (error) {
		if (error instanceof BrevoError) {
			throw new Error(`Brevo gửi email thất bại: ${error.message}`);
		}
		throw error;
	}
}

export default brevo;
