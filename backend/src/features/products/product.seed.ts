import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { slugify } from "../../utils/index.js";

interface SeedSkuInput {
	sku: string;
	price: number;
	stockQuantity: number;
	variationDetails: Record<string, string>;
}

interface SeedProductInput {
	name: string;
	description: string;
	categoryName: string;
	isActive?: boolean;
	skus: SeedSkuInput[];
}

// Chưa có category.seed.ts riêng, nên productSeed tự tạo các danh mục mẫu này nếu chưa tồn tại.
const seedCategoryNames: string[] = ["Thời Trang Nam", "Thời Trang Nữ", "Điện Tử", "Phụ Kiện"];

const seedProducts: SeedProductInput[] = [
	{
		name: "Áo Thun Cotton Basic",
		description: "Áo thun nam form regular, chất liệu cotton 100% thoáng mát, phù hợp mặc hàng ngày.",
		categoryName: "Thời Trang Nam",
		skus: [
			{ sku: "ATC-BLK-M", price: 199000, stockQuantity: 50, variationDetails: { color: "Đen", size: "M" } },
			{ sku: "ATC-BLK-L", price: 199000, stockQuantity: 40, variationDetails: { color: "Đen", size: "L" } },
			{ sku: "ATC-WHT-M", price: 199000, stockQuantity: 35, variationDetails: { color: "Trắng", size: "M" } },
		],
	},
	{
		name: "Quần Jean Slimfit",
		description: "Quần jean nam dáng slimfit, co giãn nhẹ, dễ phối đồ.",
		categoryName: "Thời Trang Nam",
		skus: [
			{ sku: "QJS-BLU-30", price: 459000, stockQuantity: 20, variationDetails: { color: "Xanh", size: "30" } },
			{ sku: "QJS-BLU-32", price: 459000, stockQuantity: 25, variationDetails: { color: "Xanh", size: "32" } },
		],
	},
	{
		name: "Đầm Maxi Hoa Nhí",
		description: "Đầm maxi họa tiết hoa nhí, chất liệu voan 2 lớp, thích hợp đi biển, dạo phố.",
		categoryName: "Thời Trang Nữ",
		skus: [
			{ sku: "DMH-PNK-S", price: 329000, stockQuantity: 15, variationDetails: { color: "Hồng", size: "S" } },
			{ sku: "DMH-PNK-M", price: 329000, stockQuantity: 18, variationDetails: { color: "Hồng", size: "M" } },
		],
	},
	{
		name: "Tai Nghe Bluetooth Chống Ồn",
		description: "Tai nghe không dây True Wireless, chống ồn chủ động, pin 24 giờ.",
		categoryName: "Điện Tử",
		skus: [
			{ sku: "TNB-BLK-STD", price: 890000, stockQuantity: 30, variationDetails: { color: "Đen" } },
			{ sku: "TNB-WHT-STD", price: 890000, stockQuantity: 22, variationDetails: { color: "Trắng" } },
		],
	},
	{
		name: "Sạc Dự Phòng 10000mAh",
		description: "Pin sạc dự phòng dung lượng 10000mAh, hỗ trợ sạc nhanh 22.5W, 2 cổng ra.",
		categoryName: "Điện Tử",
		skus: [{ sku: "SDP-10K-STD", price: 359000, stockQuantity: 60, variationDetails: { dungLuong: "10000mAh" } }],
	},
	{
		name: "Balo Laptop Chống Nước",
		description: "Balo đựng laptop 15.6 inch, vải chống nước, nhiều ngăn tiện dụng cho đi làm/đi học.",
		categoryName: "Phụ Kiện",
		skus: [
			{ sku: "BLP-BLK-STD", price: 279000, stockQuantity: 40, variationDetails: { color: "Đen" } },
			{ sku: "BLP-GRY-STD", price: 279000, stockQuantity: 28, variationDetails: { color: "Xám" } },
		],
	},
	{
		name: "Mẫu Áo Khoác Gió (Ngừng Kinh Doanh)",
		description: "Sản phẩm mẫu minh họa trạng thái ngừng kinh doanh (isActive=false), không hiển thị ở trang public.",
		categoryName: "Thời Trang Nam",
		isActive: false,
		skus: [{ sku: "AKG-BLK-L", price: 249000, stockQuantity: 0, variationDetails: { color: "Đen", size: "L" } }],
	},
];

/**
 * Seed dữ liệu danh mục & sản phẩm mẫu cho môi trường phát triển/demo.
 * Tự tạo các danh mục mẫu nếu chưa tồn tại (repo chưa có category.seed.ts riêng).
 * Chỉ chạy khi bảng products hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn sản phẩm.
 */
export const productSeed = async () => {
	const existingProducts = await prisma.product.count();
	if (existingProducts > 0) return;

	const categoryIdByName = new Map<string, number>();
	for (const name of seedCategoryNames) {
		const category = await prisma.category.upsert({
			where: { slug: slugify(name) },
			update: {},
			create: { name, slug: slugify(name) },
		});
		categoryIdByName.set(name, category.id);
	}

	for (const product of seedProducts) {
		const productSlug = slugify(product.name);
		const created = await prisma.product.create({
			data: {
				name: product.name,
				slug: productSlug,
				description: product.description,
				categoryId: categoryIdByName.get(product.categoryName) ?? null,
				isActive: product.isActive ?? true,
				skus: {
					create: product.skus.map((s) => ({
						sku: s.sku,
						price: s.price,
						stockQuantity: s.stockQuantity,
						variationDetails: s.variationDetails as Prisma.InputJsonValue,
					})),
				},
			},
			include: { skus: { orderBy: { id: "asc" } } },
		});

		// Ảnh minh họa (placeholder) để demo tính năng product_images: mỗi SKU 1 ảnh đại diện riêng,
		// keyed theo mã SKU để mỗi biến thể (màu/size khác nhau) có ảnh khác nhau trên placeholder service.
		for (const sku of created.skus) {
			await prisma.productImage.create({
				data: {
					productSkuId: sku.id,
					imageUrl: `https://picsum.photos/seed/${slugify(sku.sku)}/800/800`,
					altText: `${product.name} - ${sku.sku}`,
					isPrimary: true,
					sortOrder: 0,
				},
			});
		}

		// Đồng bộ thumbnailUrl của Product = ảnh đại diện của SKU đầu tiên (giống logic syncProductThumbnail trong product.service.ts)
		const firstSkuWithImage = created.skus[0];
		if (firstSkuWithImage) {
			await prisma.product.update({
				where: { id: created.id },
				data: { thumbnailUrl: `https://picsum.photos/seed/${slugify(firstSkuWithImage.sku)}/800/800` },
			});
		}
	}

	console.log("Seeding: Sample categories & products created successfully");
};
