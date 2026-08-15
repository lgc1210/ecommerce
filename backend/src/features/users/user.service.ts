import prisma from "../../config/prisma.js";
import pkg from "../../generated/prisma/index.js";
import { sanitizeUser } from "./user.utils.js";
import { parsePagination } from "../../utils/index.js";
import { sendEmail } from "../../config/email.js";
import { env } from "../../config/dotenv.js";
import type { AddressInput, AddressUpdateInput, ListUsersParams } from "./user.type.js";

const { Provider } = pkg;

class UserService {
	// ==========================================
	// Self-service: profile
	// ==========================================
	async updateOwnProfile(userId: number, data: { name?: string; phone?: string }) {
		if (data.phone) {
			const existing = await prisma.user.findFirst({
				where: { phone: data.phone, NOT: { id: userId } },
			});
			if (existing) {
				throw new Error("Conflict: Số điện thoại này đã được sử dụng bởi tài khoản khác.");
			}
		}

		const user = await prisma.user.update({ where: { id: userId }, data });
		return sanitizeUser(user);
	}

	// ==========================================
	// Self-service: addresses
	// ==========================================
	async listOwnAddresses(userId: number) {
		return prisma.userAddress.findMany({
			where: { userId },
			orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
		});
	}

	async createOwnAddress(userId: number, data: AddressInput) {
		const addressCount = await prisma.userAddress.count({ where: { userId } });
		// Địa chỉ đầu tiên của user luôn tự động là mặc định, bất kể input truyền gì
		const shouldBeDefault = addressCount === 0 ? true : Boolean(data.isDefault);

		if (shouldBeDefault) {
			await prisma.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
		}

		return prisma.userAddress.create({
			data: { ...data, userId, isDefault: shouldBeDefault },
		});
	}

	async updateOwnAddress(userId: number, addressId: number, data: AddressUpdateInput) {
		const address = await this.getOwnedAddressOrThrow(userId, addressId);

		// Chặn việc tự bỏ mặc định của địa chỉ đang là default mà không chỉ định địa chỉ khác thay thế
		if (data.isDefault === false && address.isDefault) {
			throw new Error("BadRequest: Không thể bỏ mặc định địa chỉ này. Hãy đặt một địa chỉ khác làm mặc định thay thế.");
		}

		if (data.isDefault === true && !address.isDefault) {
			await prisma.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
		}

		return prisma.userAddress.update({ where: { id: addressId }, data });
	}

	async setDefaultOwnAddress(userId: number, addressId: number) {
		await this.getOwnedAddressOrThrow(userId, addressId);

		await prisma.$transaction([
			prisma.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } }),
			prisma.userAddress.update({ where: { id: addressId }, data: { isDefault: true } }),
		]);

		return prisma.userAddress.findUnique({ where: { id: addressId } });
	}

	async deleteOwnAddress(userId: number, addressId: number) {
		const address = await this.getOwnedAddressOrThrow(userId, addressId);

		try {
			await prisma.userAddress.delete({ where: { id: addressId } });
		} catch {
			// Vi phạm khóa ngoại: địa chỉ đang được 1 đơn hàng tham chiếu (Order.shippingAddressId)
			throw new Error("Conflict: Không thể xóa địa chỉ này vì đã được sử dụng trong đơn hàng.");
		}

		// Vừa xóa địa chỉ mặc định mà vẫn còn địa chỉ khác -> tự động gán mặc định cho địa chỉ còn lại gần nhất
		if (address.isDefault) {
			const nextAddress = await prisma.userAddress.findFirst({
				where: { userId },
				orderBy: { createdAt: "asc" },
			});
			if (nextAddress) {
				await prisma.userAddress.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
			}
		}
	}

	private async getOwnedAddressOrThrow(userId: number, addressId: number) {
		const address = await prisma.userAddress.findUnique({ where: { id: addressId } });
		if (!address || address.userId !== userId) {
			throw new Error("NotFound: Địa chỉ không tồn tại hoặc không thuộc về bạn.");
		}
		return address;
	}

	// ==========================================
	// Admin
	// ==========================================
	async createUser(data: { name: string; email: string; phone: string; roleId: number }) {
		const [existingUser, role] = await Promise.all([prisma.user.findFirst({ where: { OR: [{ email: data.email }, { phone: data.phone }] } }), prisma.role.findUnique({ where: { id: data.roleId } })]);

		if (existingUser) {
			const field = existingUser.email === data.email ? "Email" : "Số điện thoại";
			throw new Error(`Conflict: ${field} này đã được sử dụng bởi tài khoản khác.`);
		}
		if (!role) {
			throw new Error("NotFound: Role không tồn tại.");
		}

		const user = await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				// Admin tạo tài khoản trực tiếp -> KHÔNG tự đặt/sinh mật khẩu hộ (không có kênh an
				// toàn nào để gửi mật khẩu dạng plaintext qua email). passwordHash để null, nhân
				// viên tự đặt mật khẩu lần đầu qua đúng luồng "quên mật khẩu" có sẵn bên dưới.
				passwordHash: null,
				roleId: data.roleId,
				provider: Provider.local,
				isActive: true,
				// Admin đã xác nhận danh tính nhân viên trực tiếp -> bỏ qua bước xác thực OTP đăng ký
				// (OTP đăng ký vốn dùng để chứng minh quyền sở hữu email khi TỰ đăng ký công khai).
				isVerified: true,
			},
			include: { role: { select: { id: true, name: true } } },
		});

		// Tái sử dụng luồng "quên mật khẩu" hiện có để nhân viên tự đặt mật khẩu lần đầu,
		// nhưng KHÔNG tự gọi forgotPassword() để gửi OTP ngay ở đây: mọi OTP gửi lúc này
		// chắc chắn bị vô hiệu ngay khi nhân viên tự bấm "Quên mật khẩu" ở trang login (vì
		// forgotPassword() luôn đánh expired OTP cũ trước khi phát OTP mới) -> gửi OTP ở
		// bước tạo tài khoản là email vô dụng, không ai kịp dùng tới. Thay vào đó gửi 1 email
		// chào mừng, có link trỏ thẳng tới /forgot-password (kèm sẵn email) để nhân viên bấm
		// vào là vào đúng bước đầu của luồng thật, tự bấm gửi mã và nhận OTP còn hiệu lực.
		await this.sendWelcomeEmail(user.name, user.email);

		return sanitizeUser(user);
	}

	private async sendWelcomeEmail(name: string, email: string) {
		const setupPasswordUrl = `${env.CLIENT_URL}/forgot-password?email=${encodeURIComponent(email)}`;

		await sendEmail({
			to: email,
			subject: "Tài khoản của bạn đã được tạo",
			html: `
				<p>Xin chào ${name},</p>
				<p>Quản trị viên đã tạo tài khoản cho bạn trên hệ thống. Vui lòng bấm vào liên kết bên dưới để thiết lập mật khẩu đăng nhập lần đầu:</p>
				<p><a href="${setupPasswordUrl}">${setupPasswordUrl}</a></p>
				<p>Nếu nút trên không hoạt động, hãy vào trang đăng nhập và chọn "Quên mật khẩu" với email này: <b>${email}</b>.</p>
			`,
		});
	}

	async listUsers(params: ListUsersParams) {
		const { page, limit, skip } = parsePagination(params);

		const where: Record<string, unknown> = {};
		if (params.search) {
			where.OR = [{ name: { contains: params.search } }, { email: { contains: params.search } }, { phone: { contains: params.search } }];
		}
		if (params.roleId) where.roleId = Number(params.roleId);
		if (params.isActive !== undefined) where.isActive = params.isActive === "true";

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: { role: { select: { id: true, name: true } } },
			}),
			prisma.user.count({ where }),
		]);

		return {
			data: users.map((user) => sanitizeUser(user)),
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	}

	async getUserById(id: number) {
		const user = await prisma.user.findUnique({
			where: { id },
			include: { role: { select: { id: true, name: true } }, addresses: true },
		});
		if (!user) {
			throw new Error("NotFound: Người dùng không tồn tại.");
		}
		return sanitizeUser(user);
	}

	async updateUserRole(id: number, roleId: number) {
		const [user, role] = await Promise.all([prisma.user.findUnique({ where: { id } }), prisma.role.findUnique({ where: { id: roleId } })]);
		if (!user) throw new Error("NotFound: Người dùng không tồn tại.");
		if (!role) throw new Error("NotFound: Role không tồn tại.");

		const updated = await prisma.user.update({ where: { id }, data: { roleId } });
		return sanitizeUser(updated);
	}

	async updateUserStatus(id: number, isActive: boolean) {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new Error("NotFound: Người dùng không tồn tại.");
		}

		const updated = await prisma.user.update({ where: { id }, data: { isActive } });

		// Vô hiệu hóa tài khoản -> thu hồi toàn bộ refresh token để buộc đăng xuất ngay trên mọi thiết bị
		if (!isActive) {
			await prisma.refreshToken.deleteMany({ where: { userId: id } });
		}

		return sanitizeUser(updated);
	}
}

export default new UserService();
