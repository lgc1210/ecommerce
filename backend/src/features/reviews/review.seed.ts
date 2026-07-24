import prisma from "../../config/prisma.js";

const sampleComments = [
	"Sản phẩm đúng như mô tả, chất lượng tốt, đóng gói cẩn thận.",
	"Giao hàng nhanh, sẽ ủng hộ shop tiếp.",
	"Chất liệu ổn trong tầm giá, form hơi rộng so với bảng size.",
	"Rất hài lòng, sẽ mua lại lần sau.",
	"Tạm ổn, không quá xuất sắc nhưng dùng được.",
];

/**
 * Seed dữ liệu đánh giá mẫu cho môi trường phát triển/demo.
 * Yêu cầu chạy SAU userSeed() và productSeed() vì cần userId/productId đã tồn tại sẵn.
 * Chỉ chạy khi bảng reviews hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn review.
 */
export const reviewSeed = async () => {
	const existingReviews = await prisma.review.count();
	if (existingReviews > 0) return;

	// Chỉ lấy user role "customer" để đánh giá không bị gán cho tài khoản admin/manager
	const customers = await prisma.user.findMany({
		where: { role: { name: "customer" } },
		take: 10,
		orderBy: { id: "asc" },
	});
	const products = await prisma.product.findMany({ where: { isActive: true }, take: 10, orderBy: { id: "asc" } });

	if (customers.length === 0 || products.length === 0) return;

	let commentIndex = 0;
	for (const product of products) {
		// Mỗi sản phẩm nhận 1-3 review từ các khách hàng khác nhau (unique constraint: 1 user chỉ review 1 lần / sản phẩm)
		const reviewerCount = Math.min(customers.length, (product.id % 3) + 1);
		for (let i = 0; i < reviewerCount; i++) {
			const reviewer = customers[i]!;
			const rating = 3 + ((product.id + i) % 3); // Rải điểm 3-5 sao cho tự nhiên

			await prisma.review.create({
				data: {
					userId: reviewer.id,
					productId: product.id,
					rating,
					comment: sampleComments[commentIndex % sampleComments.length]!,
				},
			});
			commentIndex += 1;
		}
	}

	console.log("Seeding: Sample reviews created successfully");
};
