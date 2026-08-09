import type { NotificationPayload } from "../notification.validation.js";

/**
 * Hợp đồng chung mọi KÊNH gửi thông báo phải triển khai (in-app/DB, email, push, ...).
 * Cùng tinh thần Strategy Pattern như `PaymentGateway`
 * (xem features/payments/gateways/gateway.types.ts): muốn thêm kênh mới chỉ cần tạo 1 file
 * `<channel>.channel.ts` implement interface này rồi đăng ký vào `channel.registry.ts` —
 * KHÔNG cần đụng vào notification.service.ts.
 *
 * Khác 1 điểm so với PaymentGateway: gateway được CHỌN 1 (theo payment method), còn channel
 * được BẮN ĐỒNG THỜI tới TẤT CẢ kênh đang bật trong registry (xem channel.registry.ts) — 1
 * thông báo có thể vừa lưu DB (in-app) vừa gửi email cùng lúc, không phải chọn 1 trong 2.
 */
export interface NotificationChannel {
	readonly name: string;

	/** Nhận 1 lô payload (batch) để kênh tự quyết định cách gửi hiệu quả nhất (vd: in-app dùng createMany). */
	send(payloads: NotificationPayload[]): Promise<void>;
}
