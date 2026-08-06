import cron from "node-cron";
import { env } from "../config/dotenv.js";
import orderService from "../features/orders/order.service.js";

/**
 * Khởi động job định kỳ dọn đơn "pending" thanh toán online quá hạn (khách bỏ ngang, không bao giờ
 * thanh toán hoặc thanh toán fail rồi không thử lại) — tự động hủy + hoàn tồn kho/lượt dùng coupon
 * sau PENDING_ORDER_TTL_HOURS giờ kể từ lúc đặt hàng. Không áp dụng cho COD (xem
 * order.service.ts -> cancelExpiredPendingOrders để biết chi tiết điều kiện).
 *
 * Lịch chạy cấu hình qua PENDING_ORDER_CLEANUP_CRON (mặc định: mỗi giờ). Gọi 1 lần lúc bootstrap ở
 * server.ts — không cần gọi lại, node-cron tự giữ lịch chạy nền suốt vòng đời process.
 */
export function startOrderCleanupJob(): void {
	cron.schedule(env.PENDING_ORDER_CLEANUP_CRON, async () => {
		try {
			const result = await orderService.cancelExpiredPendingOrders(env.PENDING_ORDER_TTL_HOURS);
			if (result.cancelled > 0) {
				console.log(`[order-cleanup] Đã hủy ${result.cancelled}/${result.scanned} đơn "pending" quá hạn thanh toán online.`);
			}
		} catch (error: any) {
			console.error("[order-cleanup] Lượt dọn đơn quá hạn gặp lỗi:", error?.message ?? error);
		}
	});

	console.log(`[order-cleanup] Đã lên lịch dọn đơn "pending" quá hạn thanh toán online (cron: "${env.PENDING_ORDER_CLEANUP_CRON}", TTL: ${env.PENDING_ORDER_TTL_HOURS}h).`);
}
