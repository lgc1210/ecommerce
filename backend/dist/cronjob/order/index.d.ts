/**
 * Khởi động job định kỳ dọn đơn "pending" thanh toán online quá hạn (khách bỏ ngang, không bao giờ
 * thanh toán hoặc thanh toán fail rồi không thử lại) — tự động hủy + hoàn tồn kho/lượt dùng coupon
 * sau PENDING_ORDER_TTL_HOURS giờ kể từ lúc đặt hàng. Không áp dụng cho COD (xem
 * order.service.ts -> cancelExpiredPendingOrders để biết chi tiết điều kiện).
 *
 * Lịch chạy cấu hình qua PENDING_ORDER_CLEANUP_CRON (mặc định: mỗi giờ). Gọi 1 lần lúc bootstrap ở
 * server.ts — không cần gọi lại, node-cron tự giữ lịch chạy nền suốt vòng đời process.
 */
export declare function startOrderCleanupJob(): void;
//# sourceMappingURL=index.d.ts.map