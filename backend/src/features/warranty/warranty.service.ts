import prisma from "../../config/prisma.js";
import { parsePagination } from "../../utils/index.js";
import { assertExchangePeriodWithinDuration } from "./warranty.utils.js";
import type {
	CreateWarrantyPolicyInput,
	ListWarrantyPoliciesParams,
	UpdateWarrantyPolicyInput,
} from "./warranty.validation.js";

class WarrantyPolicyService {
	// ==========================================
	// Admin
	// ==========================================
	async listWarrantyPolicies(params: ListWarrantyPoliciesParams) {
		const where: Record<string, unknown> = {};
		if (params.search) {
			where.name = { contains: params.search };
		}

		const { page, limit, skip } = parsePagination(params);
		const [policies, total] = await Promise.all([
			prisma.warrantyPolicy.findMany({
				where,
				include: { _count: { select: { products: true } } },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.warrantyPolicy.count({ where }),
		]);

		return {
			data: policies,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getWarrantyPolicyById(id: number) {
		const policy = await prisma.warrantyPolicy.findUnique({
			where: { id },
			include: { _count: { select: { products: true, claims: true } } },
		});

		if (!policy) {
			throw new Error("NotFound: Chính sách bảo hành không tồn tại.");
		}

		return policy;
	}

	async createWarrantyPolicy(data: CreateWarrantyPolicyInput) {
		assertExchangePeriodWithinDuration(
			data.durationValue,
			data.durationUnit,
			data.exchangePeriodValue ?? null,
			data.exchangePeriodUnit ?? null,
		);

		return prisma.warrantyPolicy.create({
			data: {
				name: data.name,
				durationValue: data.durationValue,
				durationUnit: data.durationUnit,
				warrantyType: data.warrantyType,
				exchangePeriodValue: data.exchangePeriodValue ?? null,
				exchangePeriodUnit: data.exchangePeriodUnit ?? null,
				description: data.description ?? null,
			},
		});
	}

	async updateWarrantyPolicy(id: number, data: UpdateWarrantyPolicyInput) {
		const existing = await prisma.warrantyPolicy.findUnique({ where: { id } });
		if (!existing) {
			throw new Error("NotFound: Chính sách bảo hành không tồn tại.");
		}

		// Gộp dữ liệu mới với dữ liệu hiện có để validate đúng trạng thái CUỐI CÙNG sau khi cập nhật —
		// client có thể chỉ gửi 1 trong 2 nhóm field (vd chỉ đổi durationValue, giữ nguyên exchangePeriod cũ),
		// nên phải merge rồi mới so sánh, không thể validate riêng lẻ từng field gửi lên.
		const mergedExchangeValue =
			data.exchangePeriodValue !== undefined ? data.exchangePeriodValue : existing.exchangePeriodValue;
		const mergedExchangeUnit =
			data.exchangePeriodUnit !== undefined ? data.exchangePeriodUnit : existing.exchangePeriodUnit;

		assertExchangePeriodWithinDuration(
			data.durationValue ?? existing.durationValue,
			data.durationUnit ?? existing.durationUnit,
			mergedExchangeValue,
			mergedExchangeUnit,
		);

		const updateData: Record<string, unknown> = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.durationValue !== undefined) updateData.durationValue = data.durationValue;
		if (data.durationUnit !== undefined) updateData.durationUnit = data.durationUnit;
		if (data.warrantyType !== undefined) updateData.warrantyType = data.warrantyType;
		if (data.exchangePeriodValue !== undefined) updateData.exchangePeriodValue = data.exchangePeriodValue;
		if (data.exchangePeriodUnit !== undefined) updateData.exchangePeriodUnit = data.exchangePeriodUnit;
		if (data.description !== undefined) updateData.description = data.description;

		return prisma.warrantyPolicy.update({ where: { id }, data: updateData });
	}

	async deleteWarrantyPolicy(id: number) {
		const policy = await prisma.warrantyPolicy.findUnique({
			where: { id },
			include: { _count: { select: { products: true, claims: true } } },
		});

		if (!policy) {
			throw new Error("NotFound: Chính sách bảo hành không tồn tại.");
		}

		if (policy._count.products > 0) {
			throw new Error(
				"Conflict: Không thể xóa chính sách bảo hành vì vẫn còn sản phẩm đang áp dụng. Hãy gỡ chính sách khỏi các sản phẩm đó trước.",
			);
		}

		if (policy._count.claims > 0) {
			throw new Error(
				"Conflict: Không thể xóa chính sách bảo hành đã từng được dùng để tạo yêu cầu bảo hành (sẽ phá vỡ lịch sử claim).",
			);
		}

		await prisma.warrantyPolicy.delete({ where: { id } });
	}
}

export default new WarrantyPolicyService();
