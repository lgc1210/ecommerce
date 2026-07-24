import prisma from "../../config/prisma.js";

/**
 * Seed dữ liệu địa chỉ mẫu cho môi trường phát triển/demo.
 * Chỉ chạy khi bảng user_addresses hoàn toàn trống, và chỉ seed cho các user đã tồn tại sẵn
 * (thường được tạo qua luồng đăng ký/auth), để tránh tạo dữ liệu giả không nhất quán.
 */
export const userAddressSeed = async () => {
	const existingAddresses = await prisma.userAddress.count();
	if (existingAddresses > 0) return;

	const users = await prisma.user.findMany({ take: 10, orderBy: { id: "asc" } });
	if (users.length === 0) return;

	const sampleWards = [
		"Phường Bến Nghé",
		"Phường Thảo Điền",
		"Phường Tân Định",
		"Phường Phú Định",
		"Phường Bình Chánh",
	];
	const sampleProvinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];

	for (let i = 0; i < users.length; i++) {
		const user = users[i]!;
		await prisma.userAddress.create({
			data: {
				userId: user.id,
				addressType: "shipping",
				recipientName: user.name,
				// user.phone có thể null với tài khoản đăng nhập bằng Google -> fallback về
				// một số điện thoại placeholder hợp lệ để không vi phạm cột NOT NULL của địa chỉ.
				phoneNumber: user.phone ?? "0900000000",
				addressLine: `${100 + i} Đường Nguyễn Huệ`,
				ward: sampleWards[i % sampleWards.length]!,
				province: sampleProvinces[i % sampleProvinces.length]!,
				isDefault: true,
			},
		});
	}

	console.log("Seeding: Sample user addresses created successfully");
};
