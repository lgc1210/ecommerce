import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { Prisma } from "../../generated/prisma/index.js";
import {
	createPrintUrl,
	getShippingOrderDetail,
	redeliverShippingOrder,
	returnShippingOrder,
} from "../../external/ghn/ghn.service.js";
import orderService from "../orders/order.service.js";
import type { ListShipmentsParams } from "./transport.validation.js";
import type { GhnPrintSize } from "../../external/ghn/ghn.utils.js";

const shipmentListInclude = {
	user: { select: { id: true, name: true, email: true } },
	shippingAddress: {
		select: {
			recipientName: true,
			phoneNumber: true,
			addressLine: true,
			wardName: true,
			districtName: true,
			provinceName: true,
		},
	},
	payment: { select: { paymentMethod: true, paymentStatus: true } },
};

class TransportService {
	/**
	 * Danh sách đơn đã có vận đơn GHN. Chỉ đọc từ DB (không gọi GHN cho từng dòng — sẽ rất chậm) vì
	 * `ghnStatus` đã được webhook GHN cập nhật; cần số liệu mới nhất thì dùng syncShipment().
	 */
	async listShipments(params: ListShipmentsParams) {
		const where: Prisma.OrderWhereInput = { ghnOrderCode: { not: null } };

		if (params.ghnStatus) where.ghnStatus = params.ghnStatus;
		if (params.search) {
			where.OR = [
				{ orderNumber: { contains: params.search } },
				{ ghnOrderCode: { contains: params.search } },
				{ shippingAddress: { recipientName: { contains: params.search } } },
				{ shippingAddress: { phoneNumber: { contains: params.search } } },
			];
		}
		if (params.dateFrom || params.dateTo) {
			where.createdAt = {
				...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
				...(params.dateTo ? { lte: new Date(params.dateTo) } : {}),
			};
		}

		const { page, limit, skip } = parsePagination(params);
		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where,
				include: shipmentListInclude,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		return {
			data: orders,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	/** Lấy mã vận đơn GHN của 1 đơn; ném lỗi nếu đơn không tồn tại hoặc chưa có vận đơn. */
	private async getGhnOrderCodeOrThrow(orderId: number): Promise<string> {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: { ghnOrderCode: true },
		});
		if (!order) throw new Error("NotFound: Không tìm thấy đơn hàng.");
		if (!order.ghnOrderCode)
			throw new Error(
				"BadRequest: Đơn hàng này chưa có vận đơn Giao Hàng Nhanh.",
			);
		return order.ghnOrderCode;
	}

	/** Chi tiết vận đơn đọc trực tiếp từ GHN (trạng thái hiện tại, lịch sử, ngày giao dự kiến, tình trạng thu COD...). */
	async getShipmentDetail(orderId: number) {
		const ghnOrderCode = await this.getGhnOrderCodeOrThrow(orderId);
		return getShippingOrderDetail(ghnOrderCode);
	}

	/**
	 * Đồng bộ thủ công trạng thái từ GHN về hệ thống, dùng đúng logic của webhook (syncFromGhnWebhook).
	 * Cần khi webhook bị lỡ: server tắt lúc GHN gọi, hoặc callback URL ở GHN chưa được cập nhật sau
	 * khi đổi domain backend.
	 */
	async syncShipment(orderId: number) {
		const ghnOrderCode = await this.getGhnOrderCodeOrThrow(orderId);
		const detail = await getShippingOrderDetail(ghnOrderCode);
		await orderService.syncFromGhnWebhook(ghnOrderCode, detail.status);
		return detail;
	}

	async getPrintUrl(orderId: number, size: GhnPrintSize) {
		const ghnOrderCode = await this.getGhnOrderCodeOrThrow(orderId);
		return { url: await createPrintUrl(ghnOrderCode, size) };
	}

	async redeliverShipment(orderId: number) {
		const ghnOrderCode = await this.getGhnOrderCodeOrThrow(orderId);
		await redeliverShippingOrder(ghnOrderCode);
		await this.refreshStatusQuietly(ghnOrderCode);
	}

	async returnShipment(orderId: number) {
		const ghnOrderCode = await this.getGhnOrderCodeOrThrow(orderId);
		await returnShippingOrder(ghnOrderCode);
		await this.refreshStatusQuietly(ghnOrderCode);
	}

	/**
	 * Sau khi GHN đã chấp nhận thao tác, cố gắng đồng bộ ngay trạng thái mới để danh sách không bị cũ.
	 * Best-effort: thao tác chính đã thành công ở GHN nên lỗi ở bước này không được làm request thất bại
	 * (webhook của GHN sẽ cập nhật sau).
	 */
	private async refreshStatusQuietly(ghnOrderCode: string): Promise<void> {
		try {
			const detail = await getShippingOrderDetail(ghnOrderCode);
			await orderService.syncFromGhnWebhook(ghnOrderCode, detail.status);
		} catch (error) {
			console.warn(
				`[transport] Không đồng bộ được trạng thái sau thao tác cho vận đơn ${ghnOrderCode}:`,
				error,
			);
		}
	}
}

export default new TransportService();
