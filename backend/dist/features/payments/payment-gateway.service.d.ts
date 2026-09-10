declare class PaymentGatewayService {
    /**
     * Tạo URL thanh toán cho đơn của chính user (khách bấm "Thanh toán ngay" ở trang thanh toán/chi
     * tiết đơn) — gateway sử dụng LUÔN LÀ payment.paymentMethod đã chốt lúc checkout, KHÔNG nhận
     * method từ client, tránh trường hợp khách tự đổi sang cổng khác với cổng đã chọn ban đầu.
     */
    createPaymentUrl(userId: number, orderId: number, ipAddress: string): Promise<string>;
    /**
     * Xử lý trình duyệt khách redirect về sau khi thanh toán (return URL). CHỈ dùng để hiển thị kết
     * quả tạm thời cho khách — KHÔNG đổi trạng thái Payment ở đây (xem gateway.types.ts:
     * verifyReturn để biết lý do). Trạng thái hiển thị luôn được đọc lại "tươi" từ DB, vì IPN
     * thường đến gần như đồng thời hoặc trước cả lúc trình duyệt redirect xong.
     */
    handleReturn(method: string, query: Record<string, unknown>): Promise<{
        orderId: null;
        paymentStatus: null;
        message: string;
    } | {
        orderId: number;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus | null;
        message: string;
    }>;
    /**
     * Xử lý callback server-to-server (IPN) — NGUỒN SỰ THẬT DUY NHẤT được phép cập nhật trạng thái
     * Payment. Chữ ký/MAC không hợp lệ -> bỏ qua hoàn toàn, không đổi bất kỳ trạng thái nào.
     */
    handleIpn(method: string, payload: Record<string, unknown>): Promise<{
        ok: boolean;
        message: any;
    }>;
}
declare const _default: PaymentGatewayService;
export default _default;
//# sourceMappingURL=payment-gateway.service.d.ts.map