import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { ProductUnitStatus } from "../../generated/prisma/index.js";

/**
 * Đồng bộ stockQuantity (cache) <-> ProductUnit (nguồn sự thật cho SKU có trackSerial=true).
 *
 * Quy ước approach 3 đã thống nhất: chỉ SKU có `trackSerial = true` mới có dòng ProductUnit.
 * SKU thường (trackSerial = false) không đụng gì tới các hàm ở đây — mọi hàm bên dưới đều
 * no-op an toàn nếu SKU không track serial, để gọi được ở MỌI nơi có thao tác tồn kho (checkout,
 * hủy đơn, hoàn tiền...) mà không cần if/else rẽ nhánh riêng ở nơi gọi.
 */

/**
 * Nhập kho: tạo N dòng ProductUnit mới (status = in_stock) ứng với danh sách serial, đồng thời
 * cộng dồn stockQuantity tương ứng — TRONG CÙNG 1 transaction để không bao giờ lệch nhau.
 *
 * Chỉ dùng cho SKU có trackSerial = true. Với SKU không track serial, dùng thẳng
 * productService.updateSkuStock() (sửa trực tiếp số lượng) như trước giờ.
 */
export async function receiveSerializedStock(
	productSkuId: number,
	serialNumbers: string[],
): Promise<{ createdCount: number; stockQuantity: number }> {
	const uniqueSerials = Array.from(new Set(serialNumbers.map((s) => s.trim()).filter(Boolean)));
	if (uniqueSerials.length === 0) {
		throw new Error("BadRequest: Cần ít nhất 1 số serial hợp lệ để nhập kho.");
	}
	if (uniqueSerials.length !== serialNumbers.length) {
		throw new Error("BadRequest: Danh sách serial bị trùng lặp trong chính yêu cầu này, vui lòng kiểm tra lại.");
	}

	return prisma.$transaction(async (tx) => {
		const sku = await tx.productSku.findUnique({
			where: { id: productSkuId },
			select: { id: true, trackSerial: true },
		});
		if (!sku) {
			throw new Error("NotFound: Biến thể sản phẩm không tồn tại.");
		}
		if (!sku.trackSerial) {
			throw new Error(
				"BadRequest: Biến thể này không bật quản lý theo serial (trackSerial = false). Hãy dùng chức năng cập nhật tồn kho thông thường.",
			);
		}

		// Kiểm tra trước để báo lỗi rõ ràng (serial nào đã tồn tại) thay vì để DB unique constraint
		// ném lỗi mơ hồ P2002 không rõ giá trị nào trùng.
		const existing = await tx.productUnit.findMany({
			where: { serialNumber: { in: uniqueSerials } },
			select: { serialNumber: true },
		});
		if (existing.length > 0) {
			throw new Error(
				`Conflict: Các serial sau đã tồn tại trong hệ thống: ${existing.map((e) => e.serialNumber).join(", ")}.`,
			);
		}

		await tx.productUnit.createMany({
			data: uniqueSerials.map((serialNumber) => ({
				productSkuId,
				serialNumber,
				status: ProductUnitStatus.in_stock,
			})),
		});

		const updatedSku = await tx.productSku.update({
			where: { id: productSkuId },
			data: { stockQuantity: { increment: uniqueSerials.length } },
			select: { stockQuantity: true },
		});

		return { createdCount: uniqueSerials.length, stockQuantity: updatedSku.stockQuantity };
	});
}

/**
 * Gán N đơn vị vật lý đang `in_stock` (FIFO theo createdAt — nhập trước xuất trước) cho 1
 * OrderItem vừa được tạo lúc checkout. PHẢI gọi bên trong CÙNG transaction đã trừ stockQuantity
 * ở order.service.ts, để 2 thao tác luôn commit/rollback cùng nhau — không bao giờ có tình trạng
 * stockQuantity đã trừ nhưng chưa xuất được unit nào (hoặc ngược lại).
 *
 * No-op nếu SKU không trackSerial (trường hợp phổ biến — đa số SKU không cần track serial).
 *
 * Nếu tìm được ÍT HƠN quantity đơn vị đang in_stock, ném lỗi Conflict — đây là dấu hiệu
 * stockQuantity và ProductUnit đã LỆCH NHAU (bug đồng bộ ở đâu đó), cố tình KHÔNG âm thầm cho qua
 * vì sẽ khiến 1 OrderItem có ít hơn số serial thực tế cần giao, gây sai sót khi đóng gói/bảo hành.
 */
export async function allocateSerializedUnitsForOrderItem(
	tx: Prisma.TransactionClient,
	orderItemId: number,
	productSkuId: number,
	quantity: number,
	trackSerial: boolean,
): Promise<void> {
	if (!trackSerial) return;

	const availableUnits = await tx.productUnit.findMany({
		where: { productSkuId, status: ProductUnitStatus.in_stock, orderItemId: null },
		orderBy: { createdAt: "asc" },
		take: quantity,
		select: { id: true },
	});

	if (availableUnits.length < quantity) {
		throw new Error(
			`Conflict: Tồn kho theo serial của sản phẩm (SKU #${productSkuId}) không đủ để xuất (cần ${quantity}, còn ${availableUnits.length} đơn vị). Dữ liệu tồn kho có thể đang bị lệch, vui lòng kiểm tra lại kho.`,
		);
	}

	await tx.productUnit.updateMany({
		where: { id: { in: availableUnits.map((u) => u.id) } },
		data: { status: ProductUnitStatus.sold, orderItemId },
	});
}

/**
 * Trả các đơn vị vật lý đã gán cho 1 OrderItem về lại trạng thái in_stock — dùng khi hủy đơn/hoàn
 * tiền, đối xứng với allocateSerializedUnitsForOrderItem(). PHẢI gọi cùng transaction với thao tác
 * cộng lại stockQuantity ở order.service.ts/payment.service.ts, cùng lý do đồng bộ atomic như trên.
 *
 * No-op nếu OrderItem không có ProductUnit nào gắn với nó (SKU không trackSerial).
 */
export async function releaseSerializedUnitsForOrderItem(
	tx: Prisma.TransactionClient,
	orderItemId: number,
): Promise<void> {
	await tx.productUnit.updateMany({
		where: { orderItemId },
		data: { status: ProductUnitStatus.in_stock, orderItemId: null },
	});
}
