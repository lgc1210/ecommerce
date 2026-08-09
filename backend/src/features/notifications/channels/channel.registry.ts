import { inAppChannel } from "./in-app.channel.js";
import type { NotificationChannel } from "./notification-channel.types.js";

/**
 * Đăng ký toàn bộ kênh gửi thông báo đang hoạt động. Mỗi thông báo dispatch() đi sẽ được gửi
 * qua TẤT CẢ kênh trong mảng này (xem notification-channel.types.ts để hiểu khác biệt so với
 * gateway.registry.ts của payment).
 *
 * MỞ RỘNG: thêm kênh mới (vd `email.channel.ts` dùng lại transporter có sẵn ở config/email.ts,
 * hoặc `push.channel.ts` qua socket.io) = tạo file implement `NotificationChannel` rồi thêm
 * đúng 1 dòng vào mảng dưới đây — KHÔNG cần sửa notification.service.ts,
 * notification.controller.ts, hay bất kỳ nơi nào đang gọi notificationService.notify*().
 */
export const activeChannels: NotificationChannel[] = [inAppChannel];
