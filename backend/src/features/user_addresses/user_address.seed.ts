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

	const sampleLocations = [
		{ wardName: "Phường Bến Nghé", wardCode: "26734", districtName: "Quận 1", districtId: 760, provinceName: "TP. Hồ Chí Minh", provinceId: 79 },
		{ wardName: "Phường Thảo Điền", wardCode: "27358", districtName: "TP. Thủ Đức", districtId: 769, provinceName: "TP. Hồ Chí Minh", provinceId: 79 },
		{ wardName: "Phường Tân Định", wardCode: "26650", districtName: "Quận 1", districtId: 760, provinceName: "TP. Hồ Chí Minh", provinceId: 79 },
		{ wardName: "Phường Phú Định", wardCode: "28084", districtName: "Quận 8", districtId: 774, provinceName: "TP. Hồ Chí Minh", provinceId: 79 },
		{ wardName: "Phường Bình Chánh", wardCode: "28114", districtName: "Huyện Bình Chánh", districtId: 785, provinceName: "TP. Hồ Chí Minh", provinceId: 79 },
	];
	const sampleTags = ["home", "office"] as const;

	for (let i = 0; i < users.length; i++) {
		const user = users[i]!;
		const location = sampleLocations[i % sampleLocations.length]!;
		await prisma.userAddress.create({
			data: {
				userId: user.id,
				tag: sampleTags[i % sampleTags.length]!,
				recipientName: user.name,
				// user.phone có thể null với tài khoản đăng nhập bằng Google -> fallback về
				// một số điện thoại placeholder hợp lệ để không vi phạm cột NOT NULL của địa chỉ.
				phoneNumber: user.phone ?? "0900000000",
				addressLine: `${100 + i} Đường Nguyễn Huệ`,
				wardName: location.wardName,
				wardCode: location.wardCode,
				districtName: location.districtName,
				districtId: location.districtId,
				provinceName: location.provinceName,
				provinceId: location.provinceId,
				isDefault: true,
			},
		});
	}

	console.log("Seeding: Sample user addresses created successfully");
};
