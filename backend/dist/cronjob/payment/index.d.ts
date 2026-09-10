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
export declare function startGhnShipmentRetryJob(): void;
//# sourceMappingURL=index.d.ts.map