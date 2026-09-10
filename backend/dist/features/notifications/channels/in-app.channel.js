import prisma from "../../../config/prisma.js";
/**
 * Kênh mặc định — lưu thông báo vào bảng `notifications` để hiển thị chuông/badge trong app.
 * Đây là kênh DUY NHẤT hiện có; mọi kênh khác (email, push) sau này đăng ký thêm vào
 * channel.registry.ts, không sửa gì ở đây.
 */
export const inAppChannel = {
    name: "in-app",
    async send(payloads) {
        // Chuẩn hóa optional field (undefined) -> null tường minh: khớp đúng kiểu nullable
        // NotificationCreateManyInput mà Prisma sinh ra (actionUrl?: string | null, ...), tránh
        // lỗi type dưới exactOptionalPropertyTypes: true (tsconfig).
        await prisma.notification.createMany({
            data: payloads.map((p) => ({
                userId: p.userId,
                type: p.type,
                title: p.title,
                message: p.message,
                actionUrl: p.actionUrl ?? null,
                referenceId: p.referenceId ?? null,
                imageUrl: p.imageUrl ?? null,
            })),
        });
    },
};
//# sourceMappingURL=in-app.channel.js.map