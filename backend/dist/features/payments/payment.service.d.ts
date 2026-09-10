import { PaymentMethod, PaymentStatus } from "../../generated/prisma/index.js";
import type { ListPaymentsAdminParams } from "./payment.validation.js";
declare class PaymentService {
    getOwnPayment(userId: number, orderId: number): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /**
     * Khách xác nhận đã hoàn tất thanh toán qua cổng thanh toán online (vnpay/momo/stripe/paypal).
     * COD không dùng endpoint này vì tiền được thu trực tiếp khi giao hàng, không qua cổng thanh toán.
     */
    confirmOwnPayment(userId: number, orderId: number, transactionId?: string): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /**
     * Khách đổi phương thức thanh toán cho đơn của chính mình — CHỈ khi đơn còn "pending" (chưa được
     * duyệt/xử lý) VÀ (phương thức hiện tại là COD, HOẶC là online nhưng chưa thanh toán "completed").
     * - COD -> online: đơn COD đã có sẵn vận đơn GHN thu hộ tiền mặt (tạo ngay lúc checkout()) -> phải
     *   hủy vận đơn đó trước, nếu không GHN vẫn thu COD dù khách trả tiền qua cổng online. Vận đơn thật
     *   sự chỉ được tạo lại sau khi thanh toán online "completed" (xem createShipmentAfterPayment()).
     * - online -> COD: đơn online chưa thanh toán thì CHƯA có vận đơn nào (xem checkout()) -> tạo vận
     *   đơn COD ngay, giống hệt nhánh COD lúc checkout(). Nếu GHN lỗi ở bước này, rollback lại đúng
     *   phương thức/trạng thái thanh toán cũ — không để đơn ở trạng thái "COD nhưng chưa có vận đơn"
     *   mập mờ, khách có thể thử đổi lại ngay.
     * - online -> online khác (vd vnpay -> zalopay): không đụng gì tới GHN, chỉ đổi paymentMethod.
     * "failed" được reset về "pending" khi đổi phương thức — đổi phương thức nghĩa là 1 lượt thử
     * thanh toán mới, khách cần tạo được giao dịch mới qua cổng vừa chọn (payment.utils.ts cho phép
     * failed -> pending).
     */
    changeOwnPaymentMethod(userId: number, orderId: number, newMethod: PaymentMethod): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /** Kiểm tra đơn thuộc về đúng user, phải là phương thức online (không phải COD) và chưa ở trạng thái cuối, trước khi tạo URL thanh toán mới. */
    getGatewayPaymentContext(userId: number, orderId: number): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /** Chuyển payment sang "completed" — CHỈ được gọi từ IPN/callback đã xác thực chữ ký hợp lệ (xem payment-gateway.service.ts). */
    completeGatewayPayment(orderId: number, transactionId: string | null): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /** Chuyển payment sang "failed" — CHỈ được gọi từ IPN/callback đã xác thực chữ ký hợp lệ (xem payment-gateway.service.ts). */
    failGatewayPayment(orderId: number, transactionId: string | null): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /** Đọc nhanh trạng thái thanh toán hiện tại theo orderId — dùng để hiển thị UI ở trang return (xem payment-gateway.service.ts), trả null nếu không tìm thấy thay vì ném lỗi. */
    getPaymentStatusByOrderId(orderId: number): Promise<PaymentStatus | null>;
    listPaymentsAdmin(params: ListPaymentsAdminParams): Promise<{
        data: ({
            order: {
                user: {
                    email: string;
                    id: number;
                    name: string;
                } | null;
                id: number;
                userId: number | null;
                couponId: number | null;
                orderNumber: string;
                totalAmount: import("@prisma/client-runtime-utils").Decimal;
                orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
                ghnOrderCode: string | null;
            };
        } & {
            id: number;
            createdAt: Date | null;
            orderId: number;
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            transactionId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paidAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPaymentById(id: number): Promise<{
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    /** Staff cập nhật trạng thái giao dịch thanh toán thủ công (vd: xác nhận đã nhận tiền, đánh dấu thất bại, hoàn tiền). */
    updatePaymentStatus(id: number, status: PaymentStatus, transactionId?: string): Promise<{
        order: {
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            id: number;
            userId: number | null;
            couponId: number | null;
            orderNumber: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
        };
    } & {
        id: number;
        createdAt: Date | null;
        orderId: number;
        paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
        paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
        transactionId: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paidAt: Date | null;
    }>;
    private transitionStatus;
    private getPaymentByOrderOrThrow;
    private getPaymentOrThrow;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=payment.service.d.ts.map