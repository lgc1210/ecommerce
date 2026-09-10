import { OrderStatus, Prisma } from "../../generated/prisma/index.js";
import type { BuyNowInput, CreateOrderInput, ListOrdersAdminParams, ListOwnOrdersParams } from "./order.validation.js";
declare class OrderService {
    /**
     * Tạo đơn hàng từ giỏ hàng hiện tại của user, trừ tồn kho, áp coupon (nếu có). Toàn bộ trong 1
     * transaction. LƯU Ý: KHÔNG xóa giỏ hàng sau khi đặt — khách có thể đặt lại/mua thêm từ đúng
     * giỏ hàng cũ, việc xóa/giữ giỏ hàng là do khách tự quyết định (qua API xóa giỏ hàng riêng).
     */
    checkout(userId: number, data: CreateOrderInput, userEmail?: string | null): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
            phone: string | null;
        } | null;
        items: ({
            productSku: ({
                product: {
                    id: number;
                    name: string;
                    slug: string;
                } | null;
                images: {
                    productSkuId: number;
                    sortOrder: number;
                    isPrimary: boolean;
                    id: number;
                    createdAt: Date | null;
                    imageUrl: string;
                    altText: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                productId: number | null;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
                weightGram: number;
                lengthCm: number;
                widthCm: number;
                heightCm: number;
            }) | null;
        } & {
            productSkuId: number | null;
            quantity: number;
            id: number;
            orderId: number;
            priceAtPurchase: Prisma.Decimal;
            variationSnapshot: Prisma.JsonValue | null;
        })[];
        coupon: {
            id: number;
            code: string;
            discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
            discountValue: Prisma.Decimal;
        } | null;
        payment: {
            id: number;
            createdAt: Date | null;
            orderId: number;
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            transactionId: string | null;
            amount: Prisma.Decimal;
            paidAt: Date | null;
        } | null;
        shippingAddress: {
            id: number;
            userId: number;
            createdAt: Date;
            recipientName: string;
            phoneNumber: string;
            addressLine: string;
            wardName: string;
            districtName: string;
            provinceName: string;
            provinceId: number;
            districtId: number;
            wardCode: string;
            tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
            isDefault: boolean;
        } | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /**
     * Mua ngay: khách bấm "Mua ngay" ở trang chi tiết sản phẩm -> tạo đơn thẳng với ĐÚNG 1 SKU +
     * số lượng được chọn, KHÔNG đụng tới giỏ hàng hiện có của khách (không đọc, không xoá, không
     * thêm gì vào giỏ). Toàn bộ phần còn lại (validate tồn kho, áp coupon, trừ kho, tạo vận đơn
     * COD, thông báo...) dùng chung processCheckout() với checkout() từ giỏ hàng.
     */
    buyNow(userId: number, data: BuyNowInput, userEmail?: string | null): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
            phone: string | null;
        } | null;
        items: ({
            productSku: ({
                product: {
                    id: number;
                    name: string;
                    slug: string;
                } | null;
                images: {
                    productSkuId: number;
                    sortOrder: number;
                    isPrimary: boolean;
                    id: number;
                    createdAt: Date | null;
                    imageUrl: string;
                    altText: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                productId: number | null;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
                weightGram: number;
                lengthCm: number;
                widthCm: number;
                heightCm: number;
            }) | null;
        } & {
            productSkuId: number | null;
            quantity: number;
            id: number;
            orderId: number;
            priceAtPurchase: Prisma.Decimal;
            variationSnapshot: Prisma.JsonValue | null;
        })[];
        coupon: {
            id: number;
            code: string;
            discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
            discountValue: Prisma.Decimal;
        } | null;
        payment: {
            id: number;
            createdAt: Date | null;
            orderId: number;
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            transactionId: string | null;
            amount: Prisma.Decimal;
            paidAt: Date | null;
        } | null;
        shippingAddress: {
            id: number;
            userId: number;
            createdAt: Date;
            recipientName: string;
            phoneNumber: string;
            addressLine: string;
            wardName: string;
            districtName: string;
            provinceName: string;
            provinceId: number;
            districtId: number;
            wardCode: string;
            tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
            isDefault: boolean;
        } | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /**
     * Lõi dùng chung cho checkout() (từ giỏ hàng) và buyNow() (mua thẳng 1 SKU): validate lại tồn
     * kho trong transaction, áp coupon, trừ kho, tạo đơn + payment, tạo vận đơn GHN ngay nếu COD.
     * Chống double-submit bằng 1 trong 2 cơ chế tuỳ nguồn gốc đơn: `cartCleanup` (xoá cart item —
     * dùng cho checkout() từ giỏ hàng) hoặc `idempotencyKey` (insert vào bảng gate riêng — dùng cho
     * buyNow(), không có giỏ hàng để làm gate). Xem comment chi tiết ngay đầu transaction bên dưới.
     */
    private processCheckout;
    /**
     * Tính trước phí vận chuyển GHN theo giỏ hàng hiện tại + địa chỉ giao hàng, dùng cho trang
     * checkout hiển thị phí ship cho khách TRƯỚC khi họ bấm đặt hàng (không tạo đơn, không trừ tồn kho).
     */
    previewShippingFee(userId: number, shippingAddressId: number): Promise<{
        subtotalAmount: number;
        shippingFee: number;
    }>;
    /**
     * Tương tự previewShippingFee() nhưng cho trang "Mua ngay" — tính trước phí ship + tạm tính cho
     * đúng 1 SKU (không phải cả giỏ hàng), để trang thanh toán "mua ngay" hiển thị số tiền cho khách
     * TRƯỚC khi họ bấm đặt hàng (không tạo đơn, không trừ tồn kho).
     */
    previewBuyNowShippingFee(userId: number, shippingAddressId: number, productSkuId: number, quantity: number): Promise<{
        subtotalAmount: number;
        shippingFee: number;
    }>;
    listOwnOrders(userId: number, params: ListOwnOrdersParams): Promise<{
        data: ({
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            _count: {
                items: number;
            };
            payment: {
                paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
                paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            } | null;
        } & {
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            shippingAddressId: number | null;
            couponId: number | null;
            orderNumber: string;
            subtotalAmount: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            shippingFee: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
            ghnStatus: string | null;
            deliveredAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOwnOrderById(userId: number, orderId: number): Promise<{
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /** Khách chỉ được tự hủy đơn khi đơn còn ở trạng thái "pending" (chưa được xử lý) */
    cancelOwnOrder(userId: number, orderId: number): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
            phone: string | null;
        } | null;
        items: ({
            productSku: ({
                product: {
                    id: number;
                    name: string;
                    slug: string;
                } | null;
                images: {
                    productSkuId: number;
                    sortOrder: number;
                    isPrimary: boolean;
                    id: number;
                    createdAt: Date | null;
                    imageUrl: string;
                    altText: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                productId: number | null;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
                weightGram: number;
                lengthCm: number;
                widthCm: number;
                heightCm: number;
            }) | null;
        } & {
            productSkuId: number | null;
            quantity: number;
            id: number;
            orderId: number;
            priceAtPurchase: Prisma.Decimal;
            variationSnapshot: Prisma.JsonValue | null;
        })[];
        coupon: {
            id: number;
            code: string;
            discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
            discountValue: Prisma.Decimal;
        } | null;
        payment: {
            id: number;
            createdAt: Date | null;
            orderId: number;
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            transactionId: string | null;
            amount: Prisma.Decimal;
            paidAt: Date | null;
        } | null;
        shippingAddress: {
            id: number;
            userId: number;
            createdAt: Date;
            recipientName: string;
            phoneNumber: string;
            addressLine: string;
            wardName: string;
            districtName: string;
            provinceName: string;
            provinceId: number;
            districtId: number;
            wardCode: string;
            tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
            isDefault: boolean;
        } | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /**
     * Tạo vận đơn GHN thật SAU KHI thanh toán online đã "completed" (gọi từ payment.service.ts, hoặc
     * từ retryPendingGhnShipments() bên dưới nếu lần gọi lúc IPN trước đó thất bại). Không thu COD vì
     * tiền đã thu qua cổng thanh toán.
     */
    createShipmentAfterPayment(orderId: number): Promise<void>;
    /**
     * MỚI — Tạo vận đơn GHN thu hộ COD cho 1 đơn đang "pending" — dùng khi khách đổi phương thức
     * thanh toán từ online sang COD (xem payment.service.ts -> changeOwnPaymentMethod()). Đơn online
     * chưa thanh toán thì CHƯA từng có vận đơn nào (chỉ tạo sau khi "completed", xem
     * createShipmentAfterPayment) nên gọi thẳng hàm này là an toàn, không đụng vận đơn cũ nào.
     */
    createCodShipmentForOrder(orderId: number): Promise<void>;
    /**
     * MỚI — Hủy vận đơn GHN thu hộ COD đã tạo sẵn lúc checkout() + xoá ghnOrderCode/ghnStatus khỏi
     * đơn — dùng khi khách đổi phương thức thanh toán từ COD sang thanh toán online (xem
     * payment.service.ts -> changeOwnPaymentMethod()). PHẢI hủy vận đơn COD cũ trước khi cho đổi, nếu
     * không GHN vẫn thu hộ tiền mặt lúc giao dù khách đã trả tiền qua cổng online. Nếu GHN từ chối hủy
     * (đã lấy hàng/đang giao) thì ném lỗi lên cho caller, KHÔNG cho đổi phương thức thanh toán nữa —
     * giữ đồng bộ với vận đơn thật đang chạy bên GHN (cùng tinh thần với transitionOrderStatus() -> hủy đơn).
     */
    cancelCodShipmentForPaymentMethodChange(orderId: number, ghnOrderCode: string): Promise<void>;
    /**
     * MỚI — Job định kỳ (xem cronjob/index.ts): quét các đơn đã thanh toán online "completed" nhưng
     * vẫn chưa có vận đơn GHN — tức lần tạo vận đơn lúc IPN xử lý thành công trước đó đã thất bại (vd
     * lỗi tạm thời phía GHN như timeout nội bộ "context deadline exceeded", xem payment.service.ts ->
     * transitionStatus). Bổ sung cho lớp retry-tức-thời đã có sẵn trong ghn.service.ts (chỉ cứu được
     * lỗi thoáng qua trong vài giây); job này xử lý các lỗi kéo dài hơn (GHN gián đoạn nhiều phút/giờ)
     * mà retry tức thời không cứu được, tránh phải chờ admin can thiệp thủ công cho MỌI trường hợp.
     * Không nhắm tới đơn "cancelled" (đã hoàn tiền/hủy thì không cần vận đơn nữa).
     */
    retryPendingGhnShipments(): Promise<{
        scanned: number;
        succeeded: number;
    }>;
    listOrdersAdmin(params: ListOrdersAdminParams): Promise<{
        data: ({
            user: {
                email: string;
                id: number;
                name: string;
            } | null;
            _count: {
                items: number;
            };
            payment: {
                paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
                paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            } | null;
        } & {
            id: number;
            userId: number | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            shippingAddressId: number | null;
            couponId: number | null;
            orderNumber: string;
            subtotalAmount: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            shippingFee: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
            ghnOrderCode: string | null;
            ghnStatus: string | null;
            deliveredAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOrderById(orderId: number): Promise<{
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /** Staff cập nhật trạng thái xử lý đơn hàng. Khi chuyển sang "cancelled", tự động hoàn tồn kho + hoàn lượt dùng coupon. */
    updateOrderStatus(orderId: number, status: OrderStatus): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
            phone: string | null;
        } | null;
        items: ({
            productSku: ({
                product: {
                    id: number;
                    name: string;
                    slug: string;
                } | null;
                images: {
                    productSkuId: number;
                    sortOrder: number;
                    isPrimary: boolean;
                    id: number;
                    createdAt: Date | null;
                    imageUrl: string;
                    altText: string | null;
                }[];
            } & {
                id: number;
                createdAt: Date | null;
                updatedAt: Date | null;
                productId: number | null;
                sku: string;
                price: Prisma.Decimal;
                oldPrice: Prisma.Decimal | null;
                stockQuantity: number;
                variationDetails: Prisma.JsonValue;
                weightGram: number;
                lengthCm: number;
                widthCm: number;
                heightCm: number;
            }) | null;
        } & {
            productSkuId: number | null;
            quantity: number;
            id: number;
            orderId: number;
            priceAtPurchase: Prisma.Decimal;
            variationSnapshot: Prisma.JsonValue | null;
        })[];
        coupon: {
            id: number;
            code: string;
            discountType: import("../../generated/prisma/index.js").$Enums.DiscountType;
            discountValue: Prisma.Decimal;
        } | null;
        payment: {
            id: number;
            createdAt: Date | null;
            orderId: number;
            paymentMethod: import("../../generated/prisma/index.js").$Enums.PaymentMethod;
            paymentStatus: import("../../generated/prisma/index.js").$Enums.PaymentStatus;
            transactionId: string | null;
            amount: Prisma.Decimal;
            paidAt: Date | null;
        } | null;
        shippingAddress: {
            id: number;
            userId: number;
            createdAt: Date;
            recipientName: string;
            phoneNumber: string;
            addressLine: string;
            wardName: string;
            districtName: string;
            provinceName: string;
            provinceId: number;
            districtId: number;
            wardCode: string;
            tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
            isDefault: boolean;
        } | null;
    } & {
        id: number;
        userId: number | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        shippingAddressId: number | null;
        couponId: number | null;
        orderNumber: string;
        subtotalAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        orderStatus: import("../../generated/prisma/index.js").$Enums.OrderStatus;
        ghnOrderCode: string | null;
        ghnStatus: string | null;
        deliveredAt: Date | null;
    }>;
    /**
     * Nhận cập nhật trạng thái vận chuyển từ GHN qua webhook (server-to-server, GHN gọi trực tiếp,
     * không qua người dùng). Luôn lưu lại `ghnStatus` thô; chỉ tự chuyển `orderStatus` nội bộ khi
     * trạng thái GHN đủ rõ ràng để map (xem mapGhnStatusToOrderStatus) và đơn CHƯA ở trạng thái
     * cuối (delivered/cancelled) — một khi đã ở trạng thái cuối thì không cho GHN đổi ngược lại nữa
     * (vd. GHN báo "return" sau khi đơn đã được đánh dấu "delivered" thủ công).
     */
    syncFromGhnWebhook(ghnOrderCode: string, ghnStatus: string): Promise<void>;
    /**
     * Dọn đơn "pending" thanh toán online quá hạn (job định kỳ gọi, xem order.cleanup.job.ts) —
     * khách đặt hàng nhưng bỏ ngang, không bao giờ thanh toán hoặc thanh toán fail rồi không thử
     * lại (payment.utils.ts cho phép failed -> pending nên vẫn phải chờ hết hạn mới hủy, không hủy
     * ngay khi fail). Chỉ nhắm đến đơn thanh toán ONLINE (COD không có khái niệm hết hạn thanh toán
     * — COD đã có vận đơn GHN thật ngay lúc đặt, vòng đời do GHN dẫn dắt). Hủy từng đơn qua
     * transitionOrderStatus để tái dùng đúng logic hoàn tồn kho + lượt dùng coupon; đơn online quá
     * hạn chưa từng có ghnOrderCode (xem checkout()) nên không cần gọi cancelShippingOrder.
     */
    cancelExpiredPendingOrders(ttlHours: number): Promise<{
        scanned: number;
        cancelled: number;
    }>;
    /**
     * Dọn các idempotency key của buyNow đã cũ (job định kỳ gọi, dùng chung lịch chạy với
     * cancelExpiredPendingOrders ở cronjob/index.ts). Key chỉ cần sống đủ lâu để chặn double-submit
     * XẢY RA GẦN NHAU (double click, client tự động retry do mất mạng) — không cần giữ vĩnh viễn,
     * nên xoá định kỳ tránh phình bảng vô hạn theo thời gian.
     */
    cleanupExpiredIdempotencyKeys(ttlHours: number): Promise<{
        deleted: number;
    }>;
    /**
     * Kiểm tra địa chỉ giao hàng thuộc về đúng user, load giỏ hàng hiện tại và validate từng dòng
     * (còn kinh doanh, đủ tồn kho). Dùng chung cho cả checkout() lẫn previewShippingFee() để tránh
     * lặp lại logic và đảm bảo phí ship xem trước luôn khớp với phí ship lúc đặt hàng thật.
     */
    private loadValidatedCartForCheckout;
    /**
     * "Mua ngay": kiểm tra địa chỉ giao hàng + validate ĐÚNG 1 SKU (còn kinh doanh, đủ tồn kho) —
     * hoàn toàn KHÔNG đọc/đụng tới giỏ hàng của user, khác với loadValidatedCartForCheckout() ở
     * trên. Trả về `items` có hình dạng giống hệt cart.items (thiếu field `id` của cart item vì
     * không thuộc giỏ hàng nào) để processCheckout() dùng chung logic với checkout() từ giỏ hàng.
     */
    private loadValidatedBuyNowItem;
    /** Kiểm tra địa chỉ giao hàng tồn tại và thuộc đúng user đang đặt hàng. Dùng chung cho cả checkout từ giỏ hàng lẫn mua ngay. */
    private loadOwnedShippingAddress;
    /** Gọi GHN để tính phí vận chuyển thực tế theo địa chỉ đích + khối lượng/kích thước thật của giỏ hàng. */
    private computeShippingFeeForCart;
    /**
     * @param options.source "internal" (mặc định, do admin/khách chủ động đổi) bắt buộc theo đúng
     * ALLOWED_TRANSITIONS và tự đồng bộ hủy đơn sang GHN nếu đơn đã có vận đơn. "ghn-webhook" (do
     * syncFromGhnWebhook gọi) bỏ qua kiểm tra graph — GHN là nguồn sự thật bên vận chuyển — và
     * KHÔNG gọi lại cancelShippingOrder (tránh gọi ngược lại chính nơi vừa báo cho mình).
     */
    private transitionOrderStatus;
    private getOrderOrThrow;
    /**
     * Lõi dùng chung để tạo vận đơn GHN thật cho 1 đơn đã tồn tại (KHÔNG phải lúc checkout — lúc đó
     * dùng nhánh riêng trong processCheckout() vì cần chạy chung transaction với trừ kho). Idempotent:
     * bỏ qua nếu đơn đã có ghnOrderCode (IPN/retry job có thể gọi lại nhiều lần). `collectCod` quyết
     * định GHN có thu hộ tiền mặt lúc giao hay không — false cho đơn đã thanh toán online, true cho
     * đơn COD (tiền chưa thu, GHN thu hộ khi giao). Lỗi ở đây KHÔNG có transaction bao ngoài — caller
     * tự quyết định xử lý lỗi thế nào (xem createShipmentAfterPayment/createCodShipmentForOrder).
     */
    private createGhnShipmentForOrder;
}
declare const _default: OrderService;
export default _default;
//# sourceMappingURL=order.service.d.ts.map