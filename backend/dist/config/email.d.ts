import { BrevoClient } from "@getbrevo/brevo";
declare const brevo: BrevoClient;
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
export declare function sendEmail({ to, subject, html }: SendEmailInput): Promise<void>;
export default brevo;
//# sourceMappingURL=email.d.ts.map