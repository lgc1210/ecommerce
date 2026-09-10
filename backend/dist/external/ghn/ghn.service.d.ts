interface CalculateShippingFeeInput {
    toDistrictId: number;
    toWardCode: string;
    /** Tổng khối lượng đơn hàng, tính bằng gram */
    weightGram: number;
    /** Kích thước đóng gói ước lượng của đơn hàng, tính bằng cm (xem order.utils.ts computeCartPackage) */
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    /** Giá trị khai báo bảo hiểm hàng hóa (thường = subtotal của đơn hàng) */
    insuranceValue: number;
}
/** Gọi API GHN để tính phí vận chuyển thực tế theo địa chỉ giao hàng + khối lượng/kích thước đơn hàng. */
export declare function calculateShippingFee({ toDistrictId, toWardCode, weightGram, lengthCm, widthCm, heightCm, insuranceValue }: CalculateShippingFeeInput): Promise<number>;
interface CreateShippingOrderItem {
    name: string;
    quantity: number;
}
interface CreateShippingOrderInput {
    /** Mã đơn hàng bên hệ thống mình (Order.orderNumber) — gửi làm client_order_code để đối soát/tra cứu chéo với GHN. */
    clientOrderCode: string;
    toName: string;
    toPhone: string;
    toAddress: string;
    toWardCode: string;
    toDistrictId: number;
    /** Số tiền GHN thu hộ (COD) khi giao hàng — 0 nếu khách đã thanh toán online. */
    codAmount: number;
    weightGram: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    insuranceValue: number;
    items: CreateShippingOrderItem[];
}
interface CreateShippingOrderResult {
    orderCode: string;
    expectedDeliveryTime: string | null;
}
/**
 * Tạo đơn vận chuyển thật bên GHN (v2/shipping-order/create) ngay sau khi đơn hàng được tạo thành
 * công trong hệ thống — 2 việc này PHẢI đi cùng nhau (xem order.service.ts checkout(), nơi hàm
 * này được gọi bên trong cùng 1 Prisma transaction với việc tạo Order: nếu GHN tạo đơn thất bại,
 * toàn bộ transaction rollback, đơn hàng không được coi là đặt thành công).
 *
 * Điểm lấy hàng ("from") lấy từ thông tin shop cấu hình sẵn ở .env (GHN_FROM_*) — hệ thống hiện
 * chỉ có 1 kho/cửa hàng duy nhất, không hỗ trợ nhiều điểm lấy hàng.
 */
export declare function createShippingOrder({ clientOrderCode, toName, toPhone, toAddress, toWardCode, toDistrictId, codAmount, weightGram, lengthCm, widthCm, heightCm, insuranceValue, items, }: CreateShippingOrderInput): Promise<CreateShippingOrderResult>;
/**
 * Hủy đơn vận chuyển bên GHN (v2/switch-status/cancel). GHN có thể từ chối hủy nếu đơn đã được
 * lấy hàng/đang giao — khi đó hàm này throw lỗi để order.service.ts KHÔNG cho hủy đơn ở hệ thống
 * mình nữa (giữ đồng bộ trạng thái giữa 2 bên).
 */
export declare function cancelShippingOrder(ghnOrderCode: string): Promise<void>;
export {};
//# sourceMappingURL=ghn.service.d.ts.map