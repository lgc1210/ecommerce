import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { OrderStatus, WarrantyClaimStatus } from "../../generated/prisma/index.js";
import {
	calculateWarrantyEndDate,
	generateClaimNumber,
	isValidWarrantyClaimStatusTransition,
	calculateClaimSlaDueDate,
	type WarrantyClaimStatusValue,
} from "./warranty.utils.js";
import notificationService from "../notifications/notification.service.js";
import type {
	CreateWarrantyClaimInput,
	ListMyWarrantyClaimsParams,
	AdminListWarrantyClaimsParams,
	UpdateWarrantyClaimStatusInput,
} from "./warranty-claim.validation.js";

const MAX_CLAIM_NUMBER_ATTEMPTS = 5;

// Văn phong hiển thị cho khách khi staff đổi trạng thái claim — dùng chung với
// buildWarrantyClaimStatusChangedNotification() (notification.utils.ts), ghép thành câu hoàn chỉnh
// dạng "Yêu cầu bảo hành WR-... của bạn {statusText}."
const CLAIM_STATUS_TEXT_VI: Record<WarrantyClaimStatusValue, string> = {
	pending: "đang chờ xử lý",
	approved: "đã được duyệt, dự kiến xử lý trong vài ngày tới",
	rejected: "đã bị từ chối",
	in_repair: "đang được sửa chữa/xử lý",
	completed: "đã hoàn tất",
	cancelled: "đã được hủy",
};

const warrantableOrderItemInclude = {
	order: { select: { id: true, orderNumber: true, userId: true, orderStatus: true, deliveredAt: true } },
	productSku: {
		include: {
			product: {
				select: {
					id: true,
					name: true,
					slug: true,
					warrantyPolicyId: true,
					warrantyPolicy: true,
				},
			},
			images: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }], take: 1 },
		},
	},
	// Chỉ có dữ liệu nếu SKU trackSerial — khách cần thấy đúng (các) serial thuộc về LẦN MUA CỦA
	// CHÍNH MÌNH để chọn khi gửi claim (frontend không thể tự đoán productUnitId), KHÔNG lộ serial
	// của khách khác vì luôn lọc theo orderItemId qua chính quan hệ 1-nhiều này.
	productUnits: { select: { id: true, serialNumber: true } },
};

class WarrantyClaimService {
	// ==========================================
	// Customer
	// ==========================================

	/**
	 * Danh sách OrderItem đủ điều kiện gửi claim: đơn đã giao (delivered + có deliveredAt), sản phẩm
	 * còn tồn tại và có gán WarrantyPolicy. Việc "còn hạn hay không" tính TOÁN Ở TẦNG APPLICATION
	 * (không lọc bằng where của Prisma) vì mỗi sản phẩm có thời hạn khác nhau tùy policy — không
	 * biểu diễn được bằng 1 điều kiện SQL tĩnh giống cách listReviewableOrderItems() dùng cửa sổ
	 * ngày cố định (review.service.ts).
	 */
	async listWarrantableOrderItems(userId: number) {
		const items = await prisma.orderItem.findMany({
			where: {
				order: { userId, orderStatus: OrderStatus.delivered, deliveredAt: { not: null } },
				productSku: { product: { warrantyPolicyId: { not: null } } },
			},
			include: warrantableOrderItemInclude,
			orderBy: { id: "desc" },
		});

		const now = new Date();
		return items
			.map((item) => {
				const policy = item.productSku?.product?.warrantyPolicy;
				const deliveredAt = item.order.deliveredAt;
				if (!policy || !deliveredAt) return null;

				const warrantyEndAt = calculateWarrantyEndDate(deliveredAt, policy.durationValue, policy.durationUnit);
				return {
					orderItemId: item.id,
					orderId: item.order.id,
					orderNumber: item.order.orderNumber,
					quantity: item.quantity,
					product: item.productSku?.product
						? { id: item.productSku.product.id, name: item.productSku.product.name, slug: item.productSku.product.slug }
						: null,
					productImage: item.productSku?.images?.[0]?.imageUrl ?? null,
					trackSerial: item.productSku?.trackSerial ?? false,
					// Chỉ có ý nghĩa khi trackSerial=true — danh sách serial khách được chọn lúc gửi claim.
					productUnits: item.productUnits.map((u) => ({ id: u.id, serialNumber: u.serialNumber })),
					warrantyPolicy: { id: policy.id, name: policy.name },
					warrantyStartAt: deliveredAt,
					warrantyEndAt,
					isWithinWarranty: warrantyEndAt >= now,
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null && item.isWithinWarranty);
	}

	async createWarrantyClaim(userId: number, data: CreateWarrantyClaimInput) {
		const orderItem = await prisma.orderItem.findUnique({
			where: { id: data.orderItemId },
			include: warrantableOrderItemInclude,
		});

		// Dùng chung message "NotFound" cho cả 2 trường hợp (không tồn tại / không thuộc về mình) —
		// tránh lộ thông tin đơn hàng của người khác qua việc phân biệt lỗi 404 vs 403 (đúng convention
		// đã dùng ở getOwnOrderById() bên order.service.ts).
		if (!orderItem || orderItem.order.userId !== userId) {
			throw new Error("NotFound: Sản phẩm không tồn tại trong đơn hàng của bạn.");
		}

		if (orderItem.order.orderStatus !== OrderStatus.delivered || !orderItem.order.deliveredAt) {
			throw new Error("BadRequest: Chỉ có thể gửi yêu cầu bảo hành cho đơn hàng đã giao thành công.");
		}

		if (!orderItem.productSku) {
			throw new Error("BadRequest: Sản phẩm này không còn tồn tại trong hệ thống, không thể tạo yêu cầu bảo hành.");
		}

		const policy = orderItem.productSku.product?.warrantyPolicy;
		if (!policy) {
			throw new Error("BadRequest: Sản phẩm này không có chính sách bảo hành.");
		}

		const warrantyStartAt = orderItem.order.deliveredAt;
		const warrantyEndAt = calculateWarrantyEndDate(warrantyStartAt, policy.durationValue, policy.durationUnit);
		if (warrantyEndAt < new Date()) {
			throw new Error("BadRequest: Sản phẩm đã hết hạn bảo hành.");
		}

		// Quy tắc productUnitId đã thống nhất: bắt buộc + phải verify bằng DB nếu SKU trackSerial,
		// ngược lại không được gửi (tránh khách gán nhầm serial của người khác vào claim của mình).
		if (orderItem.productSku.trackSerial) {
			if (!data.productUnitId) {
				throw new Error("BadRequest: Sản phẩm này quản lý theo serial, vui lòng cung cấp productUnitId.");
			}
			const unit = await prisma.productUnit.findUnique({ where: { id: data.productUnitId } });
			if (!unit || unit.orderItemId !== orderItem.id) {
				throw new Error("BadRequest: Serial cung cấp không khớp với sản phẩm trong đơn hàng này.");
			}
		} else if (data.productUnitId) {
			throw new Error("BadRequest: Sản phẩm này không quản lý theo serial, không cần cung cấp productUnitId.");
		}

		const claim = await prisma.$transaction(async (tx) => {
			const claimNumber = await this.generateUniqueClaimNumber(tx);

			const created = await tx.warrantyClaim.create({
				data: {
					claimNumber,
					orderItemId: orderItem.id,
					userId,
					warrantyPolicyId: policy.id,
					warrantyStartAt,
					warrantyEndAt,
					issueDescription: data.issueDescription,
					...(data.imageUrls !== undefined ? { imageUrls: data.imageUrls } : {}),
					productUnitId: data.productUnitId ?? null,
					status: WarrantyClaimStatus.pending,
				},
			});

			await tx.warrantyClaimStatusLog.create({
				data: {
					warrantyClaimId: created.id,
					fromStatus: null,
					toStatus: WarrantyClaimStatus.pending,
					actionByUserId: userId,
					note: "Khách hàng gửi yêu cầu bảo hành.",
				},
			});

			return created;
		});

		await notificationService.notifyAdminNewWarrantyClaim(
			claim.id,
			claim.claimNumber,
			orderItem.productSku.product?.name ?? "",
		);

		return claim;
	}

	async listMyWarrantyClaims(userId: number, params: ListMyWarrantyClaimsParams) {
		const where: Record<string, unknown> = { userId };
		if (params.status) where.status = params.status;

		const { page, limit, skip } = parsePagination(params);
		const [claims, total] = await Promise.all([
			prisma.warrantyClaim.findMany({
				where,
				include: {
					orderItem: {
						include: {
							productSku: { include: { product: { select: { id: true, name: true, slug: true } } } },
						},
					},
					warrantyPolicy: { select: { id: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.warrantyClaim.count({ where }),
		]);

		return {
			data: claims,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getMyWarrantyClaimById(userId: number, id: number) {
		const claim = await prisma.warrantyClaim.findUnique({
			where: { id },
			include: {
				orderItem: {
					include: {
						productSku: { include: { product: { select: { id: true, name: true, slug: true } } } },
					},
				},
				warrantyPolicy: { select: { id: true, name: true } },
				productUnit: { select: { id: true, serialNumber: true } },
				statusLogs: { orderBy: { createdAt: "asc" } },
			},
		});

		if (!claim || claim.userId !== userId) {
			throw new Error("NotFound: Yêu cầu bảo hành không tồn tại.");
		}

		return claim;
	}

	/** Khách chỉ được tự hủy claim khi còn ở trạng thái "pending" (staff chưa xử lý) — cùng nguyên
	 * tắc với cancelOwnOrder() bên order.service.ts. */
	async cancelMyWarrantyClaim(userId: number, id: number) {
		const claim = await prisma.warrantyClaim.findUnique({ where: { id } });
		if (!claim || claim.userId !== userId) {
			throw new Error("NotFound: Yêu cầu bảo hành không tồn tại.");
		}
		if (claim.status !== WarrantyClaimStatus.pending) {
			throw new Error("BadRequest: Chỉ có thể hủy yêu cầu bảo hành khi còn đang chờ xử lý.");
		}

		return prisma.$transaction(async (tx) => {
			const updated = await tx.warrantyClaim.update({
				where: { id },
				data: { status: WarrantyClaimStatus.cancelled, resolvedAt: new Date() },
			});
			await tx.warrantyClaimStatusLog.create({
				data: {
					warrantyClaimId: id,
					fromStatus: WarrantyClaimStatus.pending,
					toStatus: WarrantyClaimStatus.cancelled,
					actionByUserId: userId,
					note: "Khách hàng tự hủy yêu cầu.",
				},
			});
			return updated;
		});
	}

	// ==========================================
	// Admin (Phase 3 — staff xử lý claim)
	// ==========================================
	async listWarrantyClaimsAdmin(params: AdminListWarrantyClaimsParams) {
		const where: Record<string, unknown> = {};
		if (params.status) where.status = params.status;
		if (params.search) {
			where.OR = [
				{ claimNumber: { contains: params.search } },
				{ user: { name: { contains: params.search } } },
				{ user: { email: { contains: params.search } } },
			];
		}

		const { page, limit, skip } = parsePagination(params);
		const [claims, total] = await Promise.all([
			prisma.warrantyClaim.findMany({
				where,
				include: {
					user: { select: { id: true, name: true, email: true, phone: true } },
					orderItem: {
						include: {
							productSku: { include: { product: { select: { id: true, name: true, slug: true } } } },
						},
					},
					warrantyPolicy: { select: { id: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.warrantyClaim.count({ where }),
		]);

		return {
			data: claims,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getWarrantyClaimByIdAdmin(id: number) {
		const claim = await prisma.warrantyClaim.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, name: true, email: true, phone: true } },
				handledBy: { select: { id: true, name: true } },
				orderItem: {
					include: {
						productSku: { include: { product: { select: { id: true, name: true, slug: true } } } },
					},
				},
				warrantyPolicy: { select: { id: true, name: true } },
				productUnit: { select: { id: true, serialNumber: true } },
				statusLogs: { orderBy: { createdAt: "asc" }, include: { actionByUser: { select: { id: true, name: true } } } },
			},
		});

		if (!claim) {
			throw new Error("NotFound: Yêu cầu bảo hành không tồn tại.");
		}

		return claim;
	}

	/**
	 * Chuyển trạng thái claim (duyệt/từ chối/bắt đầu sửa/hoàn tất/hủy) — validate qua state machine
	 * isValidWarrantyClaimStatusTransition() ở warranty.utils.ts, giống hệt cách order.service.ts
	 * validate OrderStatus. Ghi log statusLogs + gửi thông báo cho khách trong CÙNG luồng xử lý.
	 *
	 * LƯU Ý PHẠM VI: khi resolutionType = "replaced" (đổi máy mới), hàm này CHỈ ghi nhận lựa chọn
	 * đó ở mức dữ liệu — KHÔNG tự động trừ kho để xuất máy mới hay tự đổi status của ProductUnit
	 * cũ sang "defective". Đây là quyết định nghiệp vụ phức tạp hơn (chọn unit nào để đổi, có tính
	 * là 1 lượt xuất kho mới hay không...) cần thống nhất riêng, tạm thời admin xử lý thủ công phần
	 * kho khi chọn "replaced" cho tới khi có yêu cầu làm luồng tự động.
	 */
	async transitionWarrantyClaimStatus(staffUserId: number, id: number, data: UpdateWarrantyClaimStatusInput) {
		const claim = await prisma.warrantyClaim.findUnique({
			where: { id },
			include: {
				orderItem: { include: { productSku: { include: { product: { select: { name: true } } } } } },
			},
		});
		if (!claim) {
			throw new Error("NotFound: Yêu cầu bảo hành không tồn tại.");
		}

		const currentStatus = claim.status as WarrantyClaimStatusValue;
		const nextStatus = data.status as WarrantyClaimStatusValue;
		if (!isValidWarrantyClaimStatusTransition(currentStatus, nextStatus)) {
			throw new Error(
				`Conflict: Không thể chuyển yêu cầu bảo hành từ trạng thái "${currentStatus}" sang "${nextStatus}".`,
			);
		}

		const updateData: Record<string, unknown> = {
			status: nextStatus,
			handledByUserId: staffUserId,
		};
		if (data.staffNote !== undefined) updateData.staffNote = data.staffNote;

		if (nextStatus === WarrantyClaimStatus.approved) {
			updateData.slaDueAt = calculateClaimSlaDueDate();
		}
		if (nextStatus === WarrantyClaimStatus.completed) {
			updateData.resolutionType = data.resolutionType;
			updateData.repairFee = data.repairFee ?? null;
			updateData.resolvedAt = new Date();
		}
		if (nextStatus === WarrantyClaimStatus.rejected) {
			// Luôn ép resolutionType = "rejected" khi chuyển sang rejected, không phụ thuộc client gửi
			// gì khác — đảm bảo dữ liệu nhất quán giữa status và resolutionType.
			updateData.resolutionType = "rejected";
			updateData.resolvedAt = new Date();
		}
		if (nextStatus === WarrantyClaimStatus.cancelled) {
			updateData.resolvedAt = new Date();
		}

		const updated = await prisma.$transaction(async (tx) => {
			const result = await tx.warrantyClaim.update({ where: { id }, data: updateData });
			await tx.warrantyClaimStatusLog.create({
				data: {
					warrantyClaimId: id,
					fromStatus: currentStatus,
					toStatus: nextStatus,
					actionByUserId: staffUserId,
					note: data.staffNote ?? null,
				},
			});
			return result;
		});

		const statusText = CLAIM_STATUS_TEXT_VI[nextStatus];
		await notificationService.notifyWarrantyClaimStatusChanged(claim.userId, claim.id, claim.claimNumber, statusText);

		return updated;
	}

	/** Sinh claimNumber và tự kiểm tra trùng trong DB (retry tối đa MAX_CLAIM_NUMBER_ATTEMPTS lần) —
	 * generateClaimNumber() ở warranty.utils.ts chỉ sinh mã, không tự đảm bảo unique. */
	private async generateUniqueClaimNumber(tx: Prisma.TransactionClient): Promise<string> {
		for (let attempt = 0; attempt < MAX_CLAIM_NUMBER_ATTEMPTS; attempt++) {
			const candidate = generateClaimNumber();
			const existing = await tx.warrantyClaim.findUnique({ where: { claimNumber: candidate }, select: { id: true } });
			if (!existing) return candidate;
		}
		throw new Error("Internal: Không thể sinh mã yêu cầu bảo hành duy nhất, vui lòng thử lại.");
	}
}

export default new WarrantyClaimService();
