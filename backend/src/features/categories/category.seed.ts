import prisma from "../../config/prisma.js";
import { slugify } from "../../utils/index.js";

interface CategorySeedNode {
	name: string;
	description?: string;
	children?: CategorySeedNode[];
}

/**
 * Cây danh mục nhiều tầng: Danh mục gốc -> Danh mục con -> Danh mục chi tiết.
 *
 * Lưu ý: tên các danh mục ở TẦNG 2 (vd: "Điện Thoại", "Laptop", "Tai Nghe"...) được giữ NGUYÊN
 * so với danh sách phẳng trước đây, vì product.seed.ts đang gán sản phẩm vào các danh mục này
 * thông qua `categoryName`. Nếu đổi tên các danh mục tầng 2 này thì cũng phải cập nhật product.seed.ts.
 */
const categoryTree: CategorySeedNode[] = [
	{
		name: "Thiết Bị Di Động",
		description: "Điện thoại và máy tính bảng các loại.",
		children: [
			{
				name: "Điện Thoại",
				description: "Điện thoại thông minh từ các thương hiệu hàng đầu.",
				children: [
					{ name: "Điện Thoại Android", description: "Điện thoại chạy hệ điều hành Android." },
					{ name: "Điện Thoại iOS", description: "Điện thoại iPhone chạy hệ điều hành iOS." },
				],
			},
			{
				name: "Máy Tính Bảng",
				description: "Máy tính bảng phục vụ học tập, giải trí và công việc.",
				children: [
					{ name: "Máy Tính Bảng Android", description: "Máy tính bảng chạy hệ điều hành Android." },
					{ name: "Máy Tính Bảng iOS", description: "iPad chạy hệ điều hành iPadOS." },
				],
			},
		],
	},
	{
		name: "Máy Tính & Laptop",
		description: "Laptop, màn hình máy tính và thiết bị lưu trữ.",
		children: [
			{
				name: "Laptop",
				description: "Laptop văn phòng, đồ hoạ và gaming.",
				children: [
					{ name: "Laptop Văn Phòng", description: "Laptop mỏng nhẹ phục vụ học tập, văn phòng." },
					{ name: "Laptop Gaming", description: "Laptop cấu hình mạnh phục vụ chơi game, đồ hoạ." },
				],
			},
			{ name: "Màn Hình Máy Tính", description: "Màn hình vi tính, màn hình gaming và đồ hoạ." },
			{ name: "Ổ Cứng & Lưu Trữ", description: "Ổ cứng SSD, HDD và các thiết bị lưu trữ di động." },
		],
	},
	{
		name: "Thiết Bị Đeo Thông Minh",
		description: "Đồng hồ thông minh và thiết bị đeo theo dõi sức khoẻ.",
		children: [
			{
				name: "Đồng Hồ Thông Minh",
				description: "Đồng hồ thông minh đa năng.",
				children: [
					{ name: "Đồng Hồ Thể Thao", description: "Đồng hồ thông minh tập trung theo dõi luyện tập, GPS." },
					{ name: "Đồng Hồ Cao Cấp", description: "Đồng hồ thông minh cao cấp, chất liệu titan/thép." },
				],
			},
		],
	},
	{
		name: "Âm Thanh",
		description: "Thiết bị âm thanh: tai nghe, loa di động.",
		children: [
			{
				name: "Tai Nghe",
				description: "Tai nghe true wireless, chụp tai, in-ear.",
				children: [
					{ name: "Tai Nghe Không Dây", description: "Tai nghe true wireless nhét tai." },
					{ name: "Tai Nghe Chụp Tai", description: "Tai nghe over-ear/on-ear chụp tai." },
				],
			},
			{ name: "Loa Bluetooth", description: "Loa bluetooth di động, chống nước." },
		],
	},
	{
		name: "Phụ Kiện Máy Tính",
		description: "Phụ kiện gaming và phụ kiện sạc cho thiết bị điện tử.",
		children: [
			{ name: "Bàn Phím Cơ", description: "Bàn phím cơ văn phòng và gaming." },
			{ name: "Chuột Gaming", description: "Chuột gaming và chuột văn phòng." },
			{ name: "Phụ Kiện Sạc", description: "Củ sạc, cáp sạc, sạc dự phòng, sạc không dây." },
		],
	},
	{
		name: "Camera & An Ninh",
		description: "Camera an ninh, máy quay hành trình và flycam.",
		children: [
			{
				name: "Camera & Thiết Bị An Ninh",
				description: "Camera giám sát, webcam và thiết bị an ninh gia đình.",
				children: [
					{ name: "Camera An Ninh Gia Đình", description: "Camera giám sát trong nhà, ngoài trời." },
					{ name: "Máy Quay & Flycam", description: "Máy quay hành trình, flycam, gimbal cầm tay." },
				],
			},
		],
	},
];

/**
 * Đệ quy upsert từng node theo slug (idempotent) và gán parentId để dựng quan hệ cha-con
 * (self-relation "CategoryHierarchy" trong schema.prisma).
 */
async function upsertCategoryNode(node: CategorySeedNode, parentId: number | null, categoryIdByName: Map<string, number>): Promise<void> {
	const slug = slugify(node.name);

	const category = await prisma.category.upsert({
		where: { slug },
		update: {
			name: node.name,
			description: node.description ?? null,
			parentId,
		},
		create: {
			name: node.name,
			slug,
			description: node.description ?? null,
			parentId,
		},
	});

	categoryIdByName.set(node.name, category.id);

	if (node.children?.length) {
		for (const child of node.children) {
			await upsertCategoryNode(child, category.id, categoryIdByName);
		}
	}
}

/**
 * Seed danh mục sản phẩm theo cấu trúc CÂY NHIỀU TẦNG (danh mục gốc -> danh mục con -> danh mục chi tiết).
 * Dùng upsert theo slug nên chạy lại nhiều lần vẫn an toàn (idempotent), không tạo trùng lặp và
 * không ghi đè dữ liệu khác của danh mục đã tồn tại (chỉ đồng bộ lại name/description/parentId).
 *
 * Trả về Map<tên danh mục, id> cho TẤT CẢ danh mục đã seed (mọi tầng) để các seed khác
 * (vd: product.seed.ts) có thể tra cứu categoryId theo tên khi gán sản phẩm vào danh mục.
 */
export const categorySeed = async (): Promise<Map<string, number>> => {
	const categoryIdByName = new Map<string, number>();

	for (const root of categoryTree) {
		await upsertCategoryNode(root, null, categoryIdByName);
	}

	console.log(`Seeding: ${categoryIdByName.size} categories (multi-level) created/updated successfully`);

	return categoryIdByName;
};
