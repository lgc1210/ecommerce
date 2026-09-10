import { OrderStatus } from "../../generated/prisma/index.js";
/** Kiểm tra việc chuyển từ trạng thái hiện tại sang trạng thái mới có hợp lệ hay không */
export declare function isValidOrderStatusTransition(current: OrderStatus, next: OrderStatus): boolean;
/** Đơn hàng chỉ được phép khôi phục tồn kho / lượt dùng coupon đúng 1 lần, khi vừa chuyển SANG "cancelled" */
export declare function isCancellation(previous: OrderStatus, next: OrderStatus): boolean;
/**
 * Sinh mã đơn hàng hiển thị cho khách, vd: "ORD-20260710-4821".
 * Không đảm bảo tuyệt đối duy nhất (va chạm gần như không thể xảy ra nhờ timestamp + random),
 * nhưng service vẫn nên bắt lỗi unique constraint từ DB để an toàn tuyệt đối.
 */
export declare function generateOrderNumber(now?: Date): string;
/**
 * Map trạng thái GHN (webhook) sang OrderStatus nội bộ. Trả về null nếu trạng thái đó chưa đủ rõ
 * ràng để tự ý chuyển trạng thái đơn (vd: "waiting_to_return") — những trường hợp này chỉ nên lưu
 * lại ghn_status thô để tham khảo.
 */
export declare function mapGhnStatusToOrderStatus(ghnStatus: string): OrderStatus | null;
interface WeighableCartItem {
    quantity: number;
    productSku: {
        weightGram: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    };
}
/**
 * Tính khối lượng (gram) + kích thước đóng gói (cm) ước lượng của giỏ hàng để gửi cho GHN tính
 * phí vận chuyển, dựa trên khối lượng/kích thước THẬT của từng biến thể (ProductSku.weightGram/
 * lengthCm/widthCm/heightCm — admin nhập khi tạo/sửa biến thể), không còn dùng giá trị mặc định
 * cấu hình cứng ở .env.
 *
 * Đây chỉ là ước lượng đơn giản, không phải thuật toán đóng gói (bin packing) thật: chiều dài/
 * rộng lấy giá trị LỚN NHẤT trong các sản phẩm (giả định xếp cạnh nhau trong cùng 1 kiện), chiều
 * cao CỘNG DỒN theo số lượng (giả định xếp chồng lên nhau). Khối lượng luôn cộng dồn chính xác.
 */
export declare function computeCartPackage(items: WeighableCartItem[]): {
    weightGram: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
};
export {};
//# sourceMappingURL=order.utils.d.ts.map