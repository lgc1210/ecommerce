import { PaymentStatus } from "../../generated/prisma/index.js";
/** Kiểm tra việc chuyển từ trạng thái thanh toán hiện tại sang trạng thái mới có hợp lệ hay không */
export declare function isValidPaymentStatusTransition(current: PaymentStatus, next: PaymentStatus): boolean;
/** Đơn hàng chỉ nên được hoàn tồn kho/coupon đúng 1 lần, khi thanh toán vừa chuyển SANG "refunded" */
export declare function isRefund(previous: PaymentStatus, next: PaymentStatus): boolean;
//# sourceMappingURL=payment.utils.d.ts.map