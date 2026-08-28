import cron from "node-cron";
import { env } from "../../config/dotenv.js";
import notificationService from "../../features/notifications/notification.service.js";
import orderService from "../../features/orders/order.service.js";

/**
 * Khởi động job định kỳ retry tạo vận đơn GHN cho các đơn đã thanh toán online "completed" nhưng
 * vẫn chưa có vận đơn (lần tạo lúc IPN xử lý thành công trước đó bị lỗi — vd log lỗi thực tế gặp
 * phải: GHN timeout tạm thời ở tầng nội bộ của họ). Bổ sung cho lớp retry-tức-thời đã có sẵn ngay
 * trong ghn.service.ts (chỉ cứu được lỗi thoáng qua trong vài giây); job này xử lý các lỗi kéo dài
 * hơn (GHN gián đoạn nhiều phút/giờ) mà retry tức thời không cứu được (xem order.service.ts ->
 * retryPendingGhnShipments()).
 *
 * Lịch chạy cấu hình qua GHN_SHIPMENT_RETRY_CRON (mặc định: mỗi 15 phút). Gọi 1 lần lúc bootstrap ở
 * server.ts, cùng chỗ với startOrderCleanupJob().
 */
export function startGhnShipmentRetryJob(): void {
	cron.schedule(env.GHN_SHIPMENT_RETRY_CRON, async () => {
		try {
			const result = await orderService.retryPendingGhnShipments();
			if (result.scanned > 0) {
				console.log(`[ghn-retry] Đã tạo lại vận đơn GHN thành công cho ${result.succeeded}/${result.scanned} đơn đang thiếu vận đơn.`);

				// Vẫn còn đơn chưa tạo được vận đơn sau lượt retry này -> nhắc lại cho admin (đơn lẻ đã
				// được cảnh báo ngay lúc lỗi đầu tiên ở payment.service.ts -> transitionStatus(), đây là
				// tổng hợp nhắc định kỳ cho các đơn còn TỒN ĐỌNG, tránh bị quên giữa các lần cảnh báo lẻ).
				const stillPending = result.scanned - result.succeeded;
				if (stillPending > 0) {
					await notificationService.notifyAdminSystemAlert(
						"Vẫn còn đơn thiếu vận đơn GHN",
						`Có ${stillPending} đơn đã thanh toán nhưng vẫn chưa tạo được vận đơn GHN sau lượt retry tự động. Cần kiểm tra và tạo vận đơn thủ công nếu GHN tiếp tục lỗi.`,
					);
				}
			}
		} catch (error: any) {
			console.error("[ghn-retry] Lượt retry vận đơn GHN gặp lỗi:", error?.message ?? error);
			try {
				await notificationService.notifyAdminSystemAlert("Lỗi job retry vận đơn GHN", `Job retry tạo vận đơn GHN gặp lỗi: ${error?.message ?? error}`);
			} catch (notifyError) {
				console.error("[ghn-retry] Bắn cảnh báo hệ thống cũng thất bại:", notifyError);
			}
		}
	});

	console.log(`[ghn-retry] Đã lên lịch retry tạo vận đơn GHN cho đơn thiếu vận đơn (cron: "${env.GHN_SHIPMENT_RETRY_CRON}").`);
}
