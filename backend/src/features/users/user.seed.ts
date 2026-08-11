import bcrypt from "bcrypt";
import prisma from "../../config/prisma.js";
import pkg from "../../generated/prisma/index.js";

const { Provider } = pkg;

const BCRYPT_SALT_ROUNDS = 10;

// Mật khẩu mặc định dùng chung cho toàn bộ tài khoản seed (chỉ dùng cho môi trường dev/demo).
// Các tài khoản này được tạo sẵn với isVerified: true để có thể đăng nhập ngay, bỏ qua bước xác thực OTP.
const SEED_PASSWORD = "Password123!";

interface SeedUserInput {
	name: string;
	email: string;
	phone: string;
	roleName: string;
}

const seedUsers: SeedUserInput[] = [{ name: "Quản Trị Viên", email: "admin@example.com", phone: "0900000001", roleName: "admin" }];

/**
 * Seed tài khoản mẫu cho môi trường phát triển/demo.
 * Yêu cầu chạy SAU roleSeed() (features/rbac/rbac.seed.ts) vì cần roleId đã tồn tại sẵn.
 * Chỉ chạy khi bảng users hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn user.
 */
export const userSeed = async () => {
	const existingUsers = await prisma.user.count();
	if (existingUsers > 0) return;

	const roles = await prisma.role.findMany({ where: { name: { in: seedUsers.map((u) => u.roleName) } } });
	const roleIdByName = new Map(roles.map((role) => [role.name, role.id]));

	const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);

	for (const seedUser of seedUsers) {
		const roleId = roleIdByName.get(seedUser.roleName);
		if (!roleId) {
			// Role tương ứng chưa tồn tại (roleSeed chưa chạy hoặc bị thay đổi tên) -> bỏ qua user này, không chặn cả seed.
			console.warn(`Seeding: Bỏ qua user '${seedUser.email}' vì role '${seedUser.roleName}' không tồn tại.`);
			continue;
		}

		await prisma.user.create({
			data: {
				name: seedUser.name,
				email: seedUser.email,
				phone: seedUser.phone,
				passwordHash,
				roleId,
				provider: Provider.local,
				isActive: true,
				isVerified: true,
			},
		});
	}

	console.log(`Seeding: Users created successfully (mật khẩu mặc định: "${SEED_PASSWORD}")`);
};
