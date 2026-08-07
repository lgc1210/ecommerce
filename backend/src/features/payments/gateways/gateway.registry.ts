import { vnpayGateway } from "./vnpay.gateway.js";
import { zalopayGateway } from "./zalopay.gateway.js";
import type { OnlineGatewayMethod, PaymentGateway } from "./gateway.types.js";
import { PaymentMethod } from "../../../generated/prisma/index.js";

/**
 * Đăng ký toàn bộ cổng thanh toán online đang hỗ trợ. "cod" KHÔNG có mặt ở đây vì không đi qua
 * cổng online (xem payment.service.ts confirmOwnPayment — COD dùng luồng riêng).
 *
 * MỞ RỘNG: thêm cổng mới (vd Momo) = tạo `momo.gateway.ts` implement `PaymentGateway`
 * (xem gateway.types.ts) rồi thêm đúng 1 dòng vào object bên dưới — KHÔNG cần sửa
 * payment-gateway.service.ts, payment-gateway.controller.ts hay routes.
 */
const gateways: Partial<Record<OnlineGatewayMethod, PaymentGateway>> = {
	[PaymentMethod.vnpay]: vnpayGateway,
	[PaymentMethod.zalopay]: zalopayGateway,
};

export function getPaymentGateway(method: string): PaymentGateway {
	const gateway = gateways[method as OnlineGatewayMethod];
	if (!gateway) {
		throw new Error(`BadRequest: Phương thức thanh toán "${method}" không hỗ trợ thanh toán online qua cổng.`);
	}
	return gateway;
}

export function isOnlineGatewayMethod(method: string): boolean {
	return method in gateways;
}
