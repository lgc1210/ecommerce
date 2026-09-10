import type { NotificationChannel } from "./notification-channel.types.js";
/**
 * Kênh mặc định — lưu thông báo vào bảng `notifications` để hiển thị chuông/badge trong app.
 * Đây là kênh DUY NHẤT hiện có; mọi kênh khác (email, push) sau này đăng ký thêm vào
 * channel.registry.ts, không sửa gì ở đây.
 */
export declare const inAppChannel: NotificationChannel;
//# sourceMappingURL=in-app.channel.d.ts.map