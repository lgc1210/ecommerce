import prisma from "../../config/prisma.js";

/**
 * Seed dữ liệu mã giảm giá mẫu cho môi trường phát triển/demo.
 * Chỉ chạy khi bảng coupons hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn coupon.
 */
export const couponSeed = async () => {
	const existingCoupons = await prisma.coupon.count();
	if (existingCoupons > 0) return;

	const now = new Date();
	const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
	const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

	await prisma.coupon.createMany({
		data: [
			{
				code: "WELCOME10",
				discountType: "percentage",
				discountValue: 10,
				minOrderValue: 200000,
				maxDiscountValue: 50000,
				startsAt: oneYearAgo,
				expiresAt: in30Days,
				usageLimit: 500,
				usedCount: 0,
				isActive: true,
			},
			{
				code: "FREESHIP30K",
				discountType: "fixed",
				discountValue: 30000,
				minOrderValue: 300000,
				maxDiscountValue: null,
				startsAt: oneYearAgo,
				expiresAt: in7Days,
				usageLimit: null,
				usedCount: 0,
				isActive: true,
			},
			{
				code: "SUMMER50",
				discountType: "percentage",
				discountValue: 50,
				minOrderValue: 500000,
				maxDiscountValue: 200000,
				startsAt: oneYearAgo,
				expiresAt: yesterday, // Mẫu minh họa coupon đã hết hạn
				usageLimit: 100,
				usedCount: 100,
				isActive: true,
			},
		],
	});

	console.log("Seeding: Sample coupons created successfully");
};
