import prisma from "../../config/prisma.js";

const sampleContacts = [
	{
		name: "Nguyễn Văn An",
		email: "nguyenvanan@example.com",
		subject: "Hỏi về đơn hàng",
		message: "Tôi đặt hàng cách đây 3 ngày nhưng chưa thấy cập nhật trạng thái vận chuyển. Nhờ shop kiểm tra giúp.",
		status: "new" as const,
	},
	{
		name: "Trần Thị Bình",
		email: "tranthibinh@example.com",
		subject: "Yêu cầu đổi hàng do lỗi kỹ thuật",
		message: "Sản phẩm tôi nhận được bị lỗi màn hình sau 2 ngày sử dụng, tôi muốn đổi sang máy mới còn bảo hành.",
		status: "in_progress" as const,
	},
	{
		name: "Lê Minh Châu",
		email: "leminhchau@example.com",
		subject: "Góp ý website",
		message: "Trang thanh toán trên điện thoại đôi khi bị lag, mong shop cải thiện thêm.",
		status: "resolved" as const,
	},
	{
		name: "Phạm Quốc Duy",
		email: "phamquocduy@example.com",
		subject: null,
		message: "Shop có chương trình cộng tác viên / affiliate không ạ? Tôi muốn tìm hiểu thêm thông tin.",
		status: "closed" as const,
	},
];

/**
 * Seed dữ liệu liên hệ mẫu cho môi trường phát triển/demo.
 * Chỉ chạy khi bảng contacts hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn liên hệ.
 * Gắn userId cho liên hệ đầu tiên (nếu có customer nào tồn tại) để minh họa trường hợp khách đã đăng nhập gửi liên hệ.
 */
export const contactSeed = async () => {
	const existingContacts = await prisma.contact.count();
	if (existingContacts > 0) return;

	const firstCustomer = await prisma.user.findFirst({ where: { role: { name: "customer" } }, orderBy: { id: "asc" } });

	await prisma.contact.createMany({
		data: sampleContacts.map((contact, index) => ({
			...contact,
			userId: index === 0 ? (firstCustomer?.id ?? null) : null,
		})),
	});

	console.log("Seeding: Sample contacts created successfully");
};
