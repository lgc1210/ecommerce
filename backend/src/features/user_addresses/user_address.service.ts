import prisma from "../../config/prisma.js";
import type { AddressTag } from "../../generated/prisma/index.js";
import { parsePagination } from "../../utils/index.js";

interface AdminUpdateAddressInput {
	tag?: AddressTag;
	recipientName?: string;
	phoneNumber?: string;
	addressLine?: string;
	wardName?: string;
	districtName?: string;
	provinceName?: string;
	provinceId?: number;
	districtId?: number;
	wardCode?: string;
	isDefault?: boolean;
}

interface ListAddressesParams {
	page?: string;
	limit?: string;
	search?: string;
	userId?: string;
	tag?: string;
	province?: string;
}

const addressWithOwnerInclude = {
	user: { select: { id: true, name: true, email: true, phone: true } },
};

/**
 * Module quản trị (admin) cho toàn bộ địa chỉ trong hệ thống, tách biệt với phần
 * self-service (đặt trong feature "users") mà mỗi khách hàng dùng để quản lý địa chỉ của chính họ.
 * Dùng cho các thao tác xuyên-user: tra cứu, hỗ trợ khách hàng, chỉnh sửa/xóa thay khách khi cần.
 */
class UserAddressService {
	// ==========================================
	// Admin: listing & lookup
	// ==========================================
	async listAddresses(params: ListAddressesParams) {
		const where: Record<string, unknown> = {};

		if (params.userId) where.userId = Number(params.userId);
		if (params.tag) where.tag = params.tag;
		if (params.province) where.provinceName = { contains: params.province };
		if (params.search) {
			where.OR = [{ recipientName: { contains: params.search } }, { phoneNumber: { contains: params.search } }, { addressLine: { contains: params.search } }];
		}

		const { page, limit, skip } = parsePagination(params);
		const [addresses, total] = await Promise.all([
			prisma.userAddress.findMany({
				where,
				include: addressWithOwnerInclude,
				orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
				skip,
				take: limit,
			}),
			prisma.userAddress.count({ where }),
		]);

		return {
			data: addresses,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getAddressById(addressId: number) {
		const address = await prisma.userAddress.findUnique({
			where: { id: addressId },
			include: addressWithOwnerInclude,
		});

		if (!address) {
			throw new Error("NotFound: Địa chỉ không tồn tại.");
		}

		return address;
	}

	async listAddressesByUser(userId: number) {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error("NotFound: Người dùng không tồn tại.");
		}

		return prisma.userAddress.findMany({
			where: { userId },
			orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
		});
	}

	// ==========================================
	// Admin: mutation
	// ==========================================
	async adminUpdateAddress(addressId: number, data: AdminUpdateAddressInput) {
		const address = await this.getAddressOrThrow(addressId);

		// Chặn việc tự bỏ mặc định của địa chỉ đang là default mà không chỉ định địa chỉ khác thay thế
		if (data.isDefault === false && address.isDefault) {
			throw new Error("BadRequest: Không thể bỏ mặc định địa chỉ này. Hãy đặt một địa chỉ khác của người dùng làm mặc định thay thế.");
		}

		if (data.isDefault === true && !address.isDefault) {
			await prisma.userAddress.updateMany({ where: { userId: address.userId, isDefault: true }, data: { isDefault: false } });
		}

		return prisma.userAddress.update({ where: { id: addressId }, data });
	}

	async adminDeleteAddress(addressId: number) {
		const address = await this.getAddressOrThrow(addressId);

		try {
			await prisma.userAddress.delete({ where: { id: addressId } });
		} catch {
			// Vi phạm khóa ngoại: địa chỉ đang được 1 đơn hàng tham chiếu (Order.shippingAddressId)
			throw new Error("Conflict: Không thể xóa địa chỉ này vì đã được sử dụng trong đơn hàng.");
		}

		// Vừa xóa địa chỉ mặc định mà user vẫn còn địa chỉ khác -> tự động gán mặc định cho địa chỉ gần nhất
		if (address.isDefault) {
			const nextAddress = await prisma.userAddress.findFirst({
				where: { userId: address.userId },
				orderBy: { createdAt: "asc" },
			});
			if (nextAddress) {
				await prisma.userAddress.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
			}
		}
	}

	// ==========================================
	// Helpers
	// ==========================================
	private async getAddressOrThrow(addressId: number) {
		const address = await prisma.userAddress.findUnique({ where: { id: addressId } });
		if (!address) {
			throw new Error("NotFound: Địa chỉ không tồn tại.");
		}
		return address;
	}
}

export default new UserAddressService();
